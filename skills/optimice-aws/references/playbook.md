# Playbook de interpretación AWS (complementario a `audit.md`)

| Hallazgo                    | Consultas y evidencias de solo lectura                                                              | Hipótesis                                         | Riesgo antes de actuar                         |
| --------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| EC2 CPU baja con pico       | CloudWatch CPU diaria + periodos de 5 min, memoria instalada/observada, ELB target latency, backlog | Downsizing o mover cron a Batch/ECS temporal      | Picos estacionales, memory pressure, licencias |
| Escalado muy frecuente      | ASG describe + CloudWatch capacidad deseada + error/p95                                             | Autoscala por CPU genérica en vez de demanda real | No reducir capacidad sin SLO y pruebas         |
| EBS `available`             | DescribeVolumes, tags y restauración                                                                | Volumen huérfano                                  | Retención o disaster recovery                  |
| EIP no asociada             | DescribeAddresses y DNS/inventario                                                                  | Cobro sin utilidad                                | Reasignación futura, terceros                  |
| NAT Gateway                 | DescribeNatGateways, métricas bytes, rutas, CE por usage type                                       | Sobrecoste por bytes/horas                        | Cambios de conectividad y redundancia          |
| ALB/NLB marginal            | ELB metrics request count + coste LCU/NLCU                                                          | Balanceador sin carga                             | Tráfico administrativo o fallback              |
| RDS sobredimensionado       | CPU, FreeableMemory, conexiones, IOPS, wait events                                                  | Ajuste de clase o query                           | Failover y licencia, IOPS pico                 |
| S3 datos fríos              | Storage Lens, Intelligent-Tiering, reglas lifecycle, access patterns                                | Tier frío / caducidad                             | Retrieving fees, mínimos y compliance          |
| CloudWatch Logs             | Ingesta, retentionInDays, búsquedas reales                                                          | Sampling y retención específica                   | Forensics y auditoría                          |
| Reservas y Savings Plans    | Cobertura, utilización, duración, uso amortizado                                                    | Baseline sin descuento u overcommit               | Obligación futura, cambios de familia          |
| Caching                     | CloudFront hit ratio, origen, RDS queries                                                           | Evitar cómputo/transferencias                     | Coherencia y datos sensibles                   |
| Arquitectura microservicios | Calls interservice, network egress, traces                                                          | Demasiada separación                              | Desacoplamiento necesario por riesgo           |

## Informe y cálculo

- Coste mensual base: **neto comparable** (amortización y descuentos coherentes). Ahorro no realizado: no estimable sin coste unitario.
- Futuro: precio estimado de configuración propuesta, más red, logs, caché, mantenimiento y migración amortizada.
- Ahorro neto = base − futuro − costes indirectos. Mostrar escenario conservador/central/optimista solo cuando hay hipótesis numéricas trazables.
- Evitar sumar ahorro de Compute Optimizer, Cost Explorer y compromiso aplicado al mismo consumo. Descontar capacidad ya cubierta por Savings Plans/RIs.
- Nivel de evidencia: A factura + métrica suficiente + dueño + SLO; B falta una pieza; C solo inventario.
- P1: recurso físico separado sin asociación, pero **requiere validación de dueño**. P2: sizing/carga de CPU. P3: refactor/red/seguridad.

## Alarmas mínimas propuestas (no crear)

Coste diario por servicio y variación frente a media comparable; gasto por pedido/transacción; SLO y p95; throttling/cola; CPU y memoria; error rate y red; EBS disponible/IPs no asociadas; utilización de compromisos; almacenamiento frío vs caliente. Los umbrales se acuerdan con responsables y estacionalidad, no se fijan universalmente.
