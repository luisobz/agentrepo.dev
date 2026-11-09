# Acceso IAM para la auditoría AWS

## Principio

Crear **fuera de esta skill**, mediante un administrador humano, un rol IAM temporal de auditoría con _trust policy_ restringida a la identidad autorizada y caducidad breve. Preferir SSO/STS y MFA donde aplique. **No pedir claves permanentes, no copiar tokens en chat, no usar AdministratorAccess ni secretos de aplicaciones.**

La política de ejemplo para las consultas incluidas en `scripts/audit.py` está en [`iam-auditoria.json`](iam-auditoria.json): Describe de EC2/ELB/RDS, `ce:GetCostAndUsage` y `cloudwatch:GetMetricStatistics`. No concede `ec2:TerminateInstances`, escritura sobre buckets, acceso a secretos ni capacidad para cambiar reservas. STS GetCallerIdentity suele funcionar sin permiso explícito.

La consulta de Cost Explorer puede necesitar acceso de facturación habilitado a nivel de cuenta y permisos en el ámbito correcto. En AWS Organizations, las cuentas miembro y la cuenta de administración pueden tener visibilidad diferente. `ce:GetCostAndUsage` no garantiza que el cliente vea el gasto de toda la organización.

**Opcionales para ampliar la revisión:** políticas administradas `CostOptimizationHubReadOnlyAccess`, `ComputeOptimizerReadOnlyAccess`, ; los permisos de consulta de Savings Plans y Reserved Instances ya se incluyen en el ejemplo porque el script los utiliza. Validar siempre el contenido actual de las políticas administradas; los permisos _read-only_ podrían revelar datos financieros sensibles.

## Verificación y ejecución

```bash
aws sts get-caller-identity --profile PERFIL_AUDITOR
python3 scripts/audit.py --profile PERFIL_AUDITOR --account-id CUENTA_12_DIGITOS --regions eu-west-1,eu-central-1
# Tras revisar el plan y autorizar consultas de facturación (potencial coste por llamadas):
python3 scripts/audit.py --profile PERFIL_AUDITOR --account-id CUENTA_12_DIGITOS --regions eu-west-1,eu-central-1 --execute --out ./resultado-aws
```

No se crea ni configura ningún rol automáticamente. El proveedor cobra ciertas llamadas de consulta según servicio, volumen o plan; confirmar costes y límites del entorno.

Fuentes: [Cost Explorer API](https://docs.aws.amazon.com/cli/latest/reference/ce/get-cost-and-usage.html), [políticas de Billing](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/managed-policies.html), [política Cost Optimization Hub read-only](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/CostOptimizationHubReadOnlyAccess.html).
