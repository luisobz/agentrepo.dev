#!/usr/bin/env python3
"""GCP inventory, Active Assist and Monitoring via GET. No resource changes.
Costs from OPTIONAL user-supplied CSV because Cloud Billing doesn't expose complete itemized costs
via a simple viewer CLI. Never enable BigQuery exports or run paid queries automatically.
"""
import argparse
import csv
import json
from collections import Counter,defaultdict
from datetime import datetime,timezone,timedelta
import math,re
from decimal import Decimal,InvalidOperation
from urllib.parse import urlencode
from urllib.request import Request,build_opener,HTTPRedirectHandler
from urllib.error import HTTPError,URLError
from common import Audit,capture

p=argparse.ArgumentParser(description='Auditoría GCP de solo lectura; por defecto mostrar plan')
p.add_argument('--project',required=True,help='ID explícito del proyecto GCP')
p.add_argument('--days',type=int,default=30)
p.add_argument('--max-metrics',type=int,default=12,help='Número máximo de VMs para consulta de métricas GET')
p.add_argument('--cost-csv',help='CSV LOCAL opcional con columnas service,cost,currency[,project]')
p.add_argument('--execute',action='store_true')
p.add_argument('--out',default='./audit-gcp-local')
a=p.parse_args()
if not 7<=a.days<=90 or not 0<=a.max_metrics<=50:p.error('--days 7-90; --max-metrics 0-50')
if not re.fullmatch(r'[a-z][a-z0-9-]{4,28}[a-z0-9]',a.project):p.error('--project requiere un ID de proyecto válido, no nombre ni número')
start=(datetime.now(timezone.utc).date()-timedelta(days=a.days)).isoformat()
end=datetime.now(timezone.utc).date().isoformat()
AUD=Audit('GCP',a.out)
if a.execute:
    try:AUD.prepare_output()
    except (OSError,ValueError):p.error('--out debe ser un directorio nuevo bajo un padre existente, sin enlaces simbólicos')
AUD.scope={'project':a.project,'start':start,'end_exclusive':end,'mode':'execute' if a.execute else 'plan',
           'cost_csv':bool(a.cost_csv),'list_limit':1000}
AUD.gaps.append('Inventarios limitados a 1000 elementos por consulta; un resultado en el límite requiere paginación adicional. No se garantiza inventario completo.')
def run(*cmd,label):
    args=['gcloud']+list(cmd)+['--format=json','--quiet']
    if 'list' in cmd:args.append('--limit=1000')
    return AUD.call(args,label,dry=not a.execute)

pr=run('projects','describe',a.project,label='Descripción del proyecto')
if isinstance(pr,dict): AUD.record('Proyecto',{'projectId':pr.get('projectId'),'lifecycleState':pr.get('lifecycleState')})
vm=run('compute','instances','list','--project',a.project,label='Compute Engine')
if isinstance(vm,list):
    rows=[{'name':x.get('name'),'id':str(x.get('id','')),'zone':str(x.get('zone','')).split('/')[-1],
           'machine_type':str(x.get('machineType','')).split('/')[-1],
           'status':x.get('status'),'labels':{k:(x.get('labels') or {}).get(k) for k in ('owner','environment')}} for x in vm]
    AUD.record('Compute Engine',{'total':len(rows),'states':dict(Counter(x['status'] for x in rows)),
                                   'machine_types':dict(Counter(x['machine_type'] for x in rows)),
                                   'without_owner':sum(not x['labels'].get('owner') for x in rows),
                                   'resources':rows[:60],'truncated':len(rows)>60})
else:rows=[]

disks=run('compute','disks','list','--project',a.project,label='Discos persistentes')
if isinstance(disks,list):
    idle=[x for x in disks if not x.get('users') and x.get('status')=='READY']
    AUD.record('Discos persistentes',{'total':len(disks),'ready_without_users':len(idle),
                                        'candidates':[{'name':x.get('name'),'size_gib':x.get('sizeGb'),
                                                       'type':str(x.get('type','')).split('/')[-1]} for x in idle[:65]]})
    for x in idle[:35]:
        AUD.find('P1','Disco sin VM usuaria',x.get('name','?'),
                 f"Disco READY sin users (tamaño {x.get('sizeGb','?')} GiB).",
                 'Comprobar snapshot, propietario y uso futuro antes de retirar o migrar a storage adecuado.')
addresses=run('compute','addresses','list','--project',a.project,label='Direcciones IP')
if isinstance(addresses,list):
    idle=[x for x in addresses if x.get('status')=='RESERVED' and not x.get('users')]
    AUD.record('Direcciones IP',{'total':len(addresses),'reserved_no_users':len(idle),
                                  'candidates':[x.get('name') for x in idle[:40]]})
    for x in idle[:30]:
        AUD.find('P2','IP reservada sin uso',x.get('name','?'),
                 'Status RESERVED y sin users en inventario.',
                 'Verificar DNS, recursos y tarifas regionales antes de liberar.')

fwd=run('compute','forwarding-rules','list','--project',a.project,label='Forwarding rules y balanceadores')
if isinstance(fwd,list):AUD.record('Forwarding rules',{'total':len(fwd),'sample':[x.get('name') for x in fwd[:45]]})
routers=run('compute','routers','list','--project',a.project,label='Cloud Routers')
if isinstance(routers,list):
    AUD.record('Cloud Routers',{'total':len(routers),'sample':[x.get('name') for x in routers[:50]]})
    for x in routers[:30]:
        region=str(x.get('region','')).split('/')[-1]
        if not region:continue
        nat=run('compute','routers','nats','list','--project',a.project,
                '--router',str(x.get('name')),'--region',region,
                label=f"Cloud NAT router {x.get('name')} región {region}")
        if isinstance(nat,list):
            AUD.record(f"Cloud NAT {x.get('name')}",{'total':len(nat),'names':[n.get('name') for n in nat]})
            for n in nat:
                AUD.find('P2','Cloud NAT y egress',n.get('name','?'),
                         f'Cloud NAT configurado en router {x.get("name")}, {region}.',
                         'Revisar bytes procesados, IPs, rutas, salida de red y coste por gateway.')
for cmd,name in [(('sql','instances','list'),'Cloud SQL'),
                 (('run','services','list'),'Cloud Run'),
                 (('container','clusters','list'),'GKE'),
                 (('storage','buckets','list'),'Cloud Storage')]:
    r=run(*cmd,'--project',a.project,label=name)
    if isinstance(r,list):
        AUD.record(name,{'count':len(r),'names':[x.get('name') or x.get('metadata',{}).get('name') for x in r[:50]]})
        if name=='Cloud Run':
            AUD.find('P3','Cloud Run: mínimo de instancias',a.project,
                     f'{len(r)} servicios listados.',
                     'Revisar min instances, concurrencia, CPU, requests y caché; no inferir infrautilización solo por contar servicios.')

# Recommender list is read-only. It may fail without a role on that specific recommender.
zones=sorted({x['zone'] for x in rows if x['zone']})[:20]
for zone in zones:
    rec=run('recommender','recommendations','list','--project',a.project,
            '--location',zone,'--recommender','google.compute.instance.MachineTypeRecommender',
            label='MachineTypeRecommender '+zone)
    if isinstance(rec,list):
        AUD.record('Recommender '+zone,{'count':len(rec),'subtypes':dict(Counter(x.get('recommenderSubtype') for x in rec))})
        for x in rec[:30]:
            AUD.find('P2','Google Recommender (machine type)',str(x.get('name','?')),
                     str(x.get('description','Recomendación de tamaño disponible')),
                     'Revisar propuesta y SLO, coste y necesidad de memoria; no aplicar automáticamente.',
                     'Indicación del proveedor pendiente de validación')

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        raise HTTPError(req.full_url,code,'Redirect rejected',headers,fp)

# GCP Monitoring API GET with a session token that never appears in stdout/reports.
if a.execute and a.max_metrics>0 and rows:
    # Token efímero solo en memoria; jamás se imprime ni se escribe en informes.
    import subprocess
    try:
        token=capture(['gcloud','auth','print-access-token','--quiet'],timeout=30).strip()
    except (OSError,ValueError,subprocess.TimeoutExpired):token=''
    if not token:AUD.gaps.append('Cloud Monitoring: no se pudo obtener un token de sesión; sin datos de CPU.')
    for v in rows[:a.max_metrics]:
        if not token:break
        flt=f'metric.type="compute.googleapis.com/instance/cpu/utilization" AND resource.type="gce_instance" AND resource.labels.instance_id="{v["id"]}"'
        q={'filter':flt,'interval.startTime':start+'T00:00:00Z','interval.endTime':end+'T00:00:00Z',
           'aggregation.alignmentPeriod':'86400s','aggregation.perSeriesAligner':'ALIGN_MEAN','view':'FULL','pageSize':'100'}
        url=f'https://monitoring.googleapis.com/v3/projects/{a.project}/timeSeries?{urlencode(q)}'
        try:
            req=Request(url,headers={'Authorization':'Bearer '+token},method='GET')
            with build_opener(NoRedirect()).open(req,timeout=25) as response:
                body=response.read(2*1024*1024+1)
                if len(body)>2*1024*1024:raise ValueError('Monitoring response too large')
                data=json.loads(body.decode('utf-8'))
            points=[float(t['value']['doubleValue'])*100 for s in data.get('timeSeries',[])
                    for t in s.get('points',[]) if t.get('value',{}).get('doubleValue') is not None]
            points=[x for x in points if math.isfinite(x) and 0<=x<=100]
            minimum=math.ceil(a.days*0.8)
            if len(points)>=minimum and sum(points)/len(points)<12:
                AUD.find('P2','Compute Engine con media baja (CPU)',v['name'],
                         f"Media diaria {sum(points)/len(points):.1f} % sobre {len(points)} puntos; {v['machine_type']}.",
                         'Revisar picos horarios y máximos, RAM, base de datos, I/O, SLO y periodo de observación antes de reducir.',
                         'Indicio por CPU media alineada por día; falta medir picos')
            elif len(points)<minimum:AUD.gaps.append(f"Cloud Monitoring {v['name']}: cobertura diaria insuficiente; no se interpreta.")
            if data.get('nextPageToken'):AUD.gaps.append(f'Cloud Monitoring {v["name"]}: paginación no recuperada.')
        except (HTTPError,URLError,TimeoutError,ValueError,KeyError) as ex:
            AUD.gaps.append(f"Cloud Monitoring {v['name']}: GET sin acceso/datos ({type(ex).__name__}).")
if len(rows)>a.max_metrics:AUD.gaps.append(f'CPU consultada para solo {a.max_metrics}/{len(rows)} VMs por límite de volumen.')

if a.cost_csv:
    if a.execute:
        try:
            by_currency=defaultdict(lambda:defaultdict(Decimal))
            if __import__('os').stat(a.cost_csv).st_size>16*1024*1024:raise ValueError('CSV too large')
            with open(a.cost_csv,newline='',encoding='utf-8-sig') as f:
                reader=csv.DictReader(f)
                required={'service','cost','currency'}
                if not required.issubset(set(reader.fieldnames or [])):
                    raise ValueError('faltan columnas service,cost,currency')
                for n,row in enumerate(reader):
                    if n>=100000:raise ValueError('CSV supera 100000 filas; agregar antes')
                    if row.get('project') and row['project']!=a.project:continue
                    currency=row['currency'].strip().upper();service=row['service'].strip()
                    if not re.fullmatch(r'[A-Z]{3}',currency) or not service or len(service)>200:raise ValueError('moneda o servicio inválido')
                    value=Decimal(row['cost'])
                    if not value.is_finite() or abs(value)>Decimal('1e15'):raise ValueError('coste inválido')
                    by_currency[currency][service]+=value
            AUD.record('Costes locales aportados por el usuario',{
                c:[{'service':s,'cost':str(round(v,2))} for s,v in sorted(services.items(),key=lambda q:-q[1])[:35]]
                for c,services in by_currency.items()})
        except (ValueError,InvalidOperation,OSError) as ex:
            AUD.gaps.append('CSV de costes no procesado: formato, valores o acceso inválidos.')
    else:
        AUD.record('CSV',{'mode':'plan','source':'fichero local especificado; no se lee hasta --execute'})
else:
    AUD.gaps.append('Sin coste monetario detallado: aportar CSV local de Cloud Billing/exportación existente. No se habilita BigQuery export ni se ejecutan queries de pago.')
AUD.gaps.append('Verificar GKE requests/limits y nodos; min instances de Cloud Run, logs, lifecycle de Cloud Storage, BigQuery bytes escaneados, CUDs, caching y seguridad de redes.')
AUD.save(plan=not a.execute)
