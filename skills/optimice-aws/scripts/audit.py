#!/usr/bin/env python3
"""AWS inventory + cost + CPU read-only; never modifies cloud resources.
Plan mode is default. Requires Python >=3.9 and AWS CLI v2 on execute.
"""
import argparse
import json
import math
import re
import sys
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta, timezone
from common import Audit

p=argparse.ArgumentParser(description='Auditoría AWS de solo lectura; por defecto muestra el plan')
p.add_argument('--regions',required=True,help='Regiones explícitas separadas por coma, ej. eu-west-1,eu-central-1')
p.add_argument('--account-id',required=True,help='Cuenta autorizada de 12 dígitos')
p.add_argument('--profile',required=True,help='Perfil AWS CLI ya configurado (NO pasar credenciales)')
p.add_argument('--days',type=int,default=30,help='Ventana de costes y CPU, 7-90 días')
p.add_argument('--max-metrics',type=int,default=15,help='Máximo de VMs consultadas en CloudWatch por ejecución')
p.add_argument('--execute',action='store_true',help='Ejecutar consultas de solo lectura (sin cambios)')
p.add_argument('--out',default='./audit-aws-local',help='Carpeta local de salida; proteger su contenido')
a=p.parse_args()
if a.days<7 or a.days>90 or a.max_metrics<0 or a.max_metrics>100: p.error('days entre 7 y 90; max-metrics entre 0 y 100')
regions=[x.strip() for x in a.regions.split(',') if x.strip()]
if not regions or len(regions)>20 or any(not all(c.isalnum() or c=='-' for c in r) for r in regions): p.error('regiones no válidas o más de 20')
if not re.fullmatch(r'[0-9]{12}',a.account_id): p.error('account-id debe tener 12 dígitos')
if any(not re.fullmatch(r'(?:us|eu|ap|sa|ca|me|af|il|mx)-(?:[a-z]+-)*[a-z]+-[0-9]+',region) for region in regions) or len(set(regions))!=len(regions): p.error('Regiones inválidas o repetidas')
start=(datetime.now(timezone.utc).date()-timedelta(days=a.days)).isoformat()
end=datetime.now(timezone.utc).date().isoformat()
AUD=Audit('AWS',a.out)
if a.execute: AUD.prepare_output()
AUD.scope={'account_id':a.account_id,'regions':regions,'start':start,'end_exclusive':end,'mode':'execute' if a.execute else 'plan'}
base=['aws']+(['--profile',a.profile] if a.profile else [])+['--no-cli-pager','--output','json','--no-cli-auto-prompt','--no-paginate']
def run(service,op,label,region=None,extra=None):
    data=AUD.call(base+[service,op]+['--region',region or regions[0]]+(extra or []),label,dry=not a.execute)
    if isinstance(data,dict) and any(data.get(k) for k in ('NextToken','nextToken','NextPageToken','NextMarker','Marker','IsTruncated','ContinuationToken')):
        AUD.gaps.append(label+': respuesta parcial con paginación, no se siguen páginas adicionales.')
    return data

identity=run('sts','get-caller-identity','Identidad de auditoría')
if a.execute and (not isinstance(identity,dict) or identity.get('Account')!=a.account_id):
    AUD.gaps.append('Identidad no verificada para la cuenta autorizada; se detiene la recogida.')
    AUD.save();sys.exit(2)
if isinstance(identity,dict): AUD.record('Cuenta verificada',{'account_suffix':a.account_id[-4:]})
# Cost Explorer is regional endpoint but organization scope may include accounts; price APIs can have request charges.
ce=run('ce','get-cost-and-usage','Cost Explorer por servicio (coste no amortizado)',region='us-east-1',extra=[
    '--time-period',f'Start={start},End={end}','--granularity','DAILY','--metrics','UnblendedCost',
    '--group-by','Type=DIMENSION,Key=SERVICE','--filter',json.dumps({'Dimensions':{'Key':'LINKED_ACCOUNT','Values':[a.account_id]}})])
if isinstance(ce,dict):
    totals=defaultdict(float);unit='USD'
    for t in ce.get('ResultsByTime',[]):
        for g in t.get('Groups',[]):
            m=g.get('Metrics',{}).get('UnblendedCost',{})
            unit=m.get('Unit',unit)
            try:
                amount=float(m['Amount'])
                if not math.isfinite(amount): raise ValueError('Nonfinite cost')
                totals[g.get('Keys',['(sin servicio)'])[0]]+=amount
            except (KeyError,TypeError,ValueError): AUD.gaps.append('Importe de coste inválido; total parcial.')
    AUD.record('Costes por servicio (UnblendedCost; ventana de días)',{'currency':unit,'top_services':
        [{'service':s,'amount':round(v,2)} for s,v in sorted(totals.items(),key=lambda q:-q[1])[:20]],
        'total_included_services':round(sum(totals.values()),2),
        'caveat':'No confundir UnblendedCost con coste amortizado o neto de créditos; verificar cobertura y cuentas.'})
    if ce.get('NextPageToken'): AUD.gaps.append('Cost Explorer paginó: esta versión no recuperó páginas siguientes; cifras incompletas.')

# Buckets listed as metadata only; object contents are never accessed.
s3=run('s3api','list-buckets','Listado de buckets S3 (solo metadatos)')
if isinstance(s3,dict):
    AUD.record('S3 buckets',{'total':len(s3.get('Buckets',[])),
                             'names':[b.get('Name') for b in s3.get('Buckets',[])[:60]]})

reservations=run('ce','get-reservation-utilization','Utilización de Reserved Instances',region='us-east-1',extra=[
    '--time-period',f'Start={start},End={end}','--granularity','MONTHLY','--filter',json.dumps({'Dimensions':{'Key':'LINKED_ACCOUNT','Values':[a.account_id]}})])
if isinstance(reservations,dict):
    AUD.record('Reservation utilization',{'month_count':len(reservations.get('UtilizationsByTime',[])),
                    'totals_sample':[t.get('Total') for t in reservations.get('UtilizationsByTime',[])[:4]],
                    'caveat':'Es necesario confirmar cobertura por servicio, hora, ámbito y contrato.'})

savings=run('ce','get-savings-plans-utilization','Utilización de Savings Plans',region='us-east-1',extra=[
    '--time-period',f'Start={start},End={end}','--granularity','MONTHLY','--filter',json.dumps({'Dimensions':{'Key':'LINKED_ACCOUNT','Values':[a.account_id]}})])
if isinstance(savings,dict):
    AUD.record('Savings Plans utilization',{'totals_sample':[x.get('Total') for x in savings.get('SavingsPlansUtilizationsByTime',[])[:4]],
                'caveat':'Revisar cobertura, compromiso, duración y amortización antes de decidir compra.'})

instances=[]
for region in regions:
    ec=run('ec2','describe-instances','Instancias EC2 '+region,region)
    if isinstance(ec,dict):
        sample=[]
        for res in ec.get('Reservations',[]):
            for i in res.get('Instances',[]):
                tags={t.get('Key',''):t.get('Value','') for t in i.get('Tags',[])}
                row={'id':i.get('InstanceId'),'type':i.get('InstanceType'),'state':i.get('State',{}).get('Name'),
                     'zone':i.get('Placement',{}).get('AvailabilityZone'),'owner':tags.get('owner',''),
                     'environment':tags.get('environment','')}
                sample.append(row)
                if row['state']=='running': instances.append((region,row))
        AUD.record('EC2 '+region,{'count':len(sample),'states':dict(Counter(x['state'] for x in sample)),
                                      'instance_types':dict(Counter(x['type'] for x in sample)),
                                      'without_owner':sum(not x['owner'] for x in sample),
                                      'resources':sample[:60],'truncated':len(sample)>60})
        if sum(not x['owner'] for x in sample):
            AUD.find('P2','Recursos sin propietario',region,
                     f"{sum(not x['owner'] for x in sample)} instancias sin tag 'owner' (solo tag con este nombre exacto)",
                     'Asignar responsables y revisar actividad; tag ausente no significa recurso inútil.')
    vols=run('ec2','describe-volumes','Volúmenes EBS '+region,region)
    if isinstance(vols,dict):
        disks=vols.get('Volumes',[]);unused=[x for x in disks if x.get('State')=='available' and not x.get('Attachments')]
        AUD.record('EBS '+region,{'total':len(disks),'available_unattached':len(unused),'sizes_gib_unattached':sum(x.get('Size',0) for x in unused),
                                    'candidates':[{'id':x.get('VolumeId'),'gib':x.get('Size'),'type':x.get('VolumeType')} for x in unused[:70]]})
        for x in unused:
            AUD.find('P1','EBS sin adjuntar',x.get('VolumeId','?'),
                     f"Volumen {x.get('Size','?')} GiB en estado available, sin attachments, región {region}.",
                     'Comprobar dueño, snapshots y retención; calcular coste GB-mes. No borrar automáticamente.',
                     'Observación de configuración; impacto y ahorro pendientes')
    ips=run('ec2','describe-addresses','Elastic IP '+region,region)
    if isinstance(ips,dict):
        idle=[x for x in ips.get('Addresses',[]) if not x.get('AssociationId')]
        AUD.record('Elastic IP '+region,{'allocated':len(ips.get('Addresses',[])),'not_associated':len(idle),
                                            'candidate_ids':[x.get('AllocationId') for x in idle[:50]]})
        for x in idle:
            AUD.find('P1','Elastic IP sin asociación',x.get('AllocationId','?'),
                     f'IP pública asignada sin AssociationId, región {region}.',
                     'Validar dependencia DNS y coste del pool de IPs antes de liberar.')
    nat=run('ec2','describe-nat-gateways','NAT Gateways '+region,region)
    if isinstance(nat,dict):
        x=[{'id':n.get('NatGatewayId'),'state':n.get('State'),'vpc':n.get('VpcId')} for n in nat.get('NatGateways',[])]
        AUD.record('NAT Gateway '+region,{'count':len(x),'resources':x[:40]})
        if x:AUD.find('P2','NAT Gateway y tráfico',region,f'{len(x)} gateways registrados.',
                     'Cruzar horas, GB procesados, rutas, endpoints S3/DynamoDB y costes por AZ antes de rediseñar.')
    endpoints=run('ec2','describe-vpc-endpoints','VPC endpoints '+region,region)
    if isinstance(endpoints,dict):
        e=endpoints.get('VpcEndpoints',[])
        AUD.record('VPC endpoints '+region,{'total':len(e),'types':dict(Counter(t.get('VpcEndpointType') for t in e))})
    lbs=run('elbv2','describe-load-balancers','Load balancers '+region,region)
    if isinstance(lbs,dict):
        lb=lbs.get('LoadBalancers',[])
        AUD.record('ELBv2 '+region,{'count':len(lb),'types':dict(Counter(t.get('Type') for t in lb)),
                                           'names':[t.get('LoadBalancerName') for t in lb[:60]]})
    logs=run('logs','describe-log-groups','CloudWatch Logs '+region,region,['--max-items','100'])
    if isinstance(logs,dict):
        groups=logs.get('logGroups',[])
        no_retention=[x.get('logGroupName') for x in groups if x.get('retentionInDays') is None]
        AUD.record('Log groups '+region,{'sample_count':len(groups),'sample_without_retention':len(no_retention),
                                          'sample_names_without_retention':no_retention[:35],
                                          'truncated_or_paginated':bool(logs.get('NextToken') or logs.get('nextToken'))})
        if no_retention:
            AUD.find('P2','Log groups sin retención configurada',region,
                     f'{len(no_retention)} de {len(groups)} log groups muestreados carecen de retentionInDays.',
                     'Revisar compliance e ingestión; la retención indefinida puede ser necesaria en ciertos grupos.')
    asg=run('autoscaling','describe-auto-scaling-groups','Auto Scaling Groups '+region,region,['--max-records','100'])
    if isinstance(asg,dict):
        arr=asg.get('AutoScalingGroups',[])
        AUD.record('Auto Scaling '+region,{'sample_count':len(arr),'groups':[
            {'name':x.get('AutoScalingGroupName'),'min':x.get('MinSize'),'desired':x.get('DesiredCapacity'),
             'max':x.get('MaxSize')} for x in arr[:45]],
             'may_have_more':bool(asg.get('NextToken'))})
    ecs=run('ecs','list-clusters','ECS '+region,region)
    if isinstance(ecs,dict):AUD.record('ECS '+region,{'sample_count':len(ecs.get('clusterArns',[]))})
    eks=run('eks','list-clusters','EKS '+region,region)
    if isinstance(eks,dict):AUD.record('EKS '+region,{'sample_count':len(eks.get('clusters',[]))})
    db=run('rds','describe-db-instances','RDS '+region,region)
    if isinstance(db,dict):
        AUD.record('RDS '+region,{'total':len(db.get('DBInstances',[])),
                                  'classes':dict(Counter(t.get('DBInstanceClass') for t in db.get('DBInstances',[])))})

# CPU mean of daily averages + peak among days. CPU does not reveal RAM or application SLO.
for region,i in instances[:a.max_metrics]:
    if not re.fullmatch(r'i-[0-9a-f]{8,17}',str(i['id'])):
        AUD.gaps.append('Identificador EC2 inválido; no se consulta métrica.');continue
    metrics=run('cloudwatch','get-metric-statistics','CPU EC2 '+i['id'],region,[
        '--namespace','AWS/EC2','--metric-name','CPUUtilization',
        '--dimensions',f"Name=InstanceId,Value={i['id']}", '--start-time',start+'T00:00:00Z',
        '--end-time',end+'T00:00:00Z','--period','86400','--statistics','Average','Maximum'])
    if isinstance(metrics,dict):
        d=metrics.get('Datapoints',[])
        days={str(v.get('Timestamp',''))[:10] for v in d if start<=str(v.get('Timestamp',''))[:10]<end and isinstance(v.get('Average'),(int,float)) and isinstance(v.get('Maximum'),(int,float)) and math.isfinite(v['Average']) and math.isfinite(v['Maximum'])}
        if len(days)<math.ceil(a.days*0.8) or len(days)!=len(d):
            AUD.gaps.append(f"CPU {i['id']}: cobertura diaria insuficiente o inválida; no inferir uso bajo")
            continue
        avg=sum(v['Average'] for v in d if 'Average' in v)/max(1,sum('Average' in v for v in d))
        peak=max((v.get('Maximum',0) for v in d),default=0)
        if avg<12:
            AUD.find('P2','Posible right-sizing/aislar picos',i['id'],
                     f'CPU media de promedios diarios {avg:.1f} %, máximo observado {peak:.1f} %, {len(d)} días; instancia {i["type"]}.',
                     'Verificar RAM, IOPS, p95, cola, patrón horario y reservas; valorar menor tamaño o worker batch.',
                     'Indicio con métrica CPU; no decisión automática')
if len(instances)>a.max_metrics:AUD.gaps.append(f"CPU observada para solo {a.max_metrics}/{len(instances)} EC2 running por límite --max-metrics.")
AUD.gaps.append('Inventarios limitados a una página por API; consultas regionales explícitas, S3 y facturación de ámbito de cuenta. Cost Explorer filtrado a LINKED_ACCOUNT. No se detecta drift de identidad durante la ejecución.')
AUD.gaps.append('Revisión adicional requerida: uso real de log groups, S3 por clase, snapshots, reservas por recurso, ECS/EKS por workload, caché y coste por transferencia mediante métricas y Cost Explorer.')
AUD.save(plan=not a.execute)
