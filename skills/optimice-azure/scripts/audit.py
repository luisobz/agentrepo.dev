#!/usr/bin/env python3
"""Scoped Azure public-cloud inventory and a fixed Cost Management read query."""
import argparse
from collections import Counter
from datetime import datetime, timedelta, timezone
import json
import math
import re
import uuid
from common import Audit

API_VERSION = '2026-06-01'
MAX_ITEMS = 1000


def arguments():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--subscription', required=True, help='Explicit subscription UUID')
    parser.add_argument('--days', type=int, default=30)
    parser.add_argument('--max-metrics', type=int, default=15)
    parser.add_argument('--cost-type', choices=['ActualCost', 'AmortizedCost'], default='ActualCost')
    parser.add_argument('--execute', action='store_true')
    parser.add_argument('--out', default='./audit-azure-local')
    args = parser.parse_args()
    if not 7 <= args.days <= 90 or not 0 <= args.max_metrics <= 50:
        parser.error('--days: 7-90; --max-metrics: 0-50')
    try:
        canonical = str(uuid.UUID(args.subscription))
        if canonical != args.subscription.lower():
            raise ValueError('Expected a canonical UUID')
        args.subscription = canonical
    except ValueError:
        parser.error('--subscription requiere un UUID de suscripción, no un nombre ni un argumento CLI')
    return parser, args


def query(audit, args, command, label):
    return audit.call(['az', *command, '--subscription', args.subscription,
                       '--only-show-errors', '-o', 'json'], label, dry=not args.execute)


def inventory(audit, args, command, label):
    rows = query(audit, args, [*command, '--query', f'[:{MAX_ITEMS}]'], label)
    if not isinstance(rows, list) or not all(isinstance(row, dict) for row in rows):
        if rows is not None:
            audit.gaps.append(f'{label}: formato de inventario inesperado.')
        return []
    if len(rows) >= MAX_ITEMS:
        audit.gaps.append(f'{label}: límite de {MAX_ITEMS} elementos; cobertura parcial.')
    return rows[:MAX_ITEMS]


def collect_inventory(audit, args):
    resources = inventory(audit, args, ['resource', 'list'], 'Inventario de recursos')
    audit.record('Recursos por tipo', {'total_observed': len(resources),
                 'types': dict(Counter(str(row.get('type', '?')) for row in resources)),
                 'without_owner': sum(not (row.get('tags') or {}).get('owner') for row in resources)})
    vms = inventory(audit, args, ['vm', 'list'], 'Máquinas virtuales')
    rows = [{'id': row.get('id'), 'name': row.get('name'),
             'size': (row.get('hardwareProfile') or {}).get('vmSize'),
             'region': row.get('location')} for row in vms]
    audit.record('VM', {'total_observed': len(rows), 'resources': rows[:65]})
    disks = inventory(audit, args, ['disk', 'list'], 'Discos administrados')
    for row in disks[:100]:
        if not row.get('managedBy') and not row.get('managedByExtended') and str(row.get('diskState', '')).lower() == 'unattached':
            audit.find('P2', 'Disco sin adjuntar', row.get('name'),
                       'Sin asociaciones observadas; DiskState Unattached.',
                       'Validar propietario, restauración, dependencias y coste por SKU antes de proponer cambios.')
    ips = inventory(audit, args, ['network', 'public-ip', 'list'], 'IP públicas')
    for row in ips[:100]:
        if not any(row.get(key) for key in ['ipConfiguration', 'natGateway', 'linkedPublicIPAddress', 'servicePublicIPAddress']):
            audit.find('P2', 'IP pública sin binding', row.get('name'),
                       'Sin asociaciones en los campos observados.',
                       'Validar otras asociaciones, DNS y función de respaldo; no implica que sea prescindible.')
    commands = [(['network', 'nat', 'gateway', 'list'], 'NAT Gateways'),
                (['network', 'application-gateway', 'list'], 'Application Gateways'),
                (['network', 'private-endpoint', 'list'], 'Private Endpoints'),
                (['appservice', 'plan', 'list'], 'App Service Plans'),
                (['storage', 'account', 'list'], 'Storage accounts')]
    for command, label in commands:
        items = inventory(audit, args, command, label)
        audit.record(label, {'total_observed': len(items), 'resources': [
            {'name': item.get('name'), 'sku': item.get('sku'), 'region': item.get('location')} for item in items[:40]]})
    recommendations = inventory(audit, args, ['advisor', 'recommendation', 'list', '--category', 'Cost'], 'Azure Advisor Cost')
    audit.record('Azure Advisor Cost', {'total_observed': len(recommendations), 'sample': [
        {'resource': (item.get('properties') or {}).get('resourceMetadata'),
         'description': (item.get('properties') or {}).get('shortDescription')} for item in recommendations[:35]]})
    return rows


def collect_costs(audit, args, start, end):
    body = {'type': args.cost_type, 'timeframe': 'Custom',
            'timePeriod': {'from': start.isoformat().replace('+00:00', 'Z'),
                           'to': (end - timedelta(seconds=1)).isoformat().replace('+00:00', 'Z')},
            'dataset': {'granularity': 'None',
                        'aggregation': {'totalCost': {'name': 'PreTaxCost', 'function': 'Sum'}},
                        'grouping': [{'type': 'Dimension', 'name': 'ServiceName'}]}}
    url = f'https://management.azure.com/subscriptions/{args.subscription}/providers/Microsoft.CostManagement/query?api-version={API_VERSION}'
    cost = query(audit, args, ['rest', '--method', 'post', '--url', url,
                             '--headers', 'Content-Type=application/json', '--body', json.dumps(body)],
                 'Cost Management Query (POST de consulta)')
    if not args.execute:
        return
    properties = cost.get('properties') if isinstance(cost, dict) else None
    if not isinstance(properties, dict):
        audit.gaps.append('Cost Management: sin respuesta interpretable; no se infiere gasto cero.')
        return
    columns = [column.get('name') for column in properties.get('columns', []) if isinstance(column, dict)]
    rows = properties.get('rows')
    amount = next((name for name in ['PreTaxCost', 'Cost', 'CostInBillingCurrency'] if name in columns), None)
    if not amount or 'Currency' not in columns or not isinstance(rows, list):
        audit.gaps.append('Cost Management: columnas de coste o moneda desconocidas; sin interpretación monetaria.')
        return
    records = []
    for row in rows[:400]:
        if not isinstance(row, list) or len(row) != len(columns):
            audit.gaps.append('Cost Management: fila con estructura inesperada; datos incompletos.')
            continue
        record = dict(zip(columns, row))
        value = record[amount]
        if type(value) not in (int, float) or not math.isfinite(value) or not isinstance(record['Currency'], str):
            audit.gaps.append('Cost Management: coste o moneda inválidos; fila no interpretada.')
            continue
        records.append(record)
    audit.record('Cost Management por servicio', {'cost_type': args.cost_type, 'columns': columns,
                 'rows': records[:40], 'rows_returned': len(rows), 'displayed': min(len(records), 40),
                 'coverage': 'Solo el ámbito de suscripción y la primera página; no acredita la factura completa.'})
    if len(rows) > 40:
        audit.gaps.append('Cost Management: informe limitado a 40 filas; muestra parcial.')
    if properties.get('nextLink') or cost.get('nextLink'):
        audit.gaps.append('Cost Management: paginación pendiente; no se sigue nextLink automáticamente.')


def collect_cpu(audit, args, vms, start, end):
    pattern = re.compile(rf'/subscriptions/{re.escape(args.subscription)}/resourceGroups/[^/]+/providers/Microsoft.Compute/virtualMachines/[^/]+', re.IGNORECASE)
    for vm in vms[:args.max_metrics]:
        resource = vm.get('id')
        if not isinstance(resource, str) or not pattern.fullmatch(resource):
            audit.gaps.append('VM: identificador fuera del ámbito o inválido; métricas omitidas.')
            continue
        metrics = query(audit, args, ['monitor', 'metrics', 'list', '--resource', resource,
                        '--metric', 'Percentage CPU', '--start-time', start.isoformat(), '--end-time', end.isoformat(),
                        '--interval', 'P1D', '--aggregation', 'Average', 'Maximum'], f'CPU VM {vm.get("name")}')
        if not isinstance(metrics, dict):
            continue
        samples = {}
        duplicate = False
        for metric in metrics.get('value', []):
            for series in metric.get('timeseries', []):
                for point in series.get('data', []):
                    try:
                        stamp = datetime.fromisoformat(point['timeStamp'].replace('Z', '+00:00'))
                        average = point.get('average')
                        if not start <= stamp < end or type(average) not in (int, float) or not math.isfinite(average) or not 0 <= average <= 100:
                            continue
                        day = stamp.date().isoformat()
                        duplicate = duplicate or day in samples
                        samples[day] = average
                    except (KeyError, TypeError, ValueError):
                        continue
        if duplicate or len(samples) < math.ceil(args.days * 0.8):
            audit.gaps.append(f'VM {vm.get("name")}: cobertura diaria insuficiente o series duplicadas; sin evaluación.')
        elif sum(samples.values()) / len(samples) < 12:
            audit.find('P2', 'Posible VM sobredimensionada', vm.get('name'),
                       f'CPU media diaria {sum(samples.values()) / len(samples):.1f} % sobre {len(samples)} días; tamaño {vm.get("size")}.',
                       'Validar máximos, memoria, I/O, p95, calendario del negocio y SLO antes de dimensionar.',
                       'Indicio por medias de CPU; no demuestra capacidad prescindible')
    if len(vms) > args.max_metrics:
        audit.gaps.append(f'CPU: selección parcial de {args.max_metrics}/{len(vms)} VMs.')


def main():
    parser, args = arguments()
    audit = Audit('Azure', args.out)
    if args.execute:
        try:
            audit.prepare_output()
        except (OSError, ValueError):
            parser.error('--out debe ser un directorio nuevo bajo un padre existente, sin enlaces simbólicos')
    end = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    start = end - timedelta(days=args.days)
    audit.scope = {'subscription_suffix': args.subscription[-8:], 'start': start.isoformat(),
                   'end_exclusive': end.isoformat(), 'cost_type': args.cost_type, 'mode': 'execute' if args.execute else 'plan'}
    account = query(audit, args, ['account', 'show'], 'Suscripción e identidad existentes')
    if args.execute and (not isinstance(account, dict) or str(account.get('id', '')).lower() != args.subscription or account.get('environmentName') != 'AzureCloud'):
        audit.gaps.append('No se ha verificado el ámbito de Azure público solicitado; no se realizan más consultas.')
        audit.save()
        return 2
    audit.gaps.append('Listados limitados a 1000 resultados de salida; Azure CLI puede paginar internamente. Respuestas mayores de 8 MiB o consultas de más de 90 s se interrumpen.')
    vms = collect_inventory(audit, args)
    collect_costs(audit, args, start, end)
    collect_cpu(audit, args, vms, start, end)
    audit.gaps.append('Pendiente validar memoria, picos, utilización de planes y reservas, AKS, Blob, Log Analytics, caché y requisitos del servicio. El inventario no calcula ahorro neto.')
    audit.save(plan=not args.execute)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
