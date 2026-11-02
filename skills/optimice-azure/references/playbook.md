# Playbook de interpretación Azure

| Tema | Evidencia necesaria | Alternativa a evaluar | Precaución |
|---|---|---|---|
| VM con CPU 5-10 % y pico corto | Azure Monitor p95, CPU, memoria invitado, batch timetable | Resize, Azure Batch / Container Apps Job | Coste de memoria, ventanas críticas |
| Scale Set con escalado caro | Métricas de autoscale, queue length, errores, p95 | Ajustar baseline y desacoplar jobs | Backpressure, límites reales |
| App Service Plan poco utilizado | Instancias, tamaño, CPU y apps por plan | Consolidar planes compatibles | Aislamiento de aplicaciones |
| AKS pequeño pero caro | Node usage, requests/limits, DaemonSets, LoadBalancer | Ajustar nodos o Container Apps | Seguridad, networking y operaciones |
| Disk Unattached / Public IP | Azure Resource Graph, dependencia, coste por SKU | Retirar después de validación | Snapshots y DNS |
| NAT Gateway / endpoints | GB, horas, topologías de subredes y privacidad | Simplificar rutas o gateways | Exigencias de red privada |
| Application Gateway / Firewall | Requests, throughput, logs, reglas usadas | Resize/consolidación | WAF, auditoría, continuidad |
| Blob/Backups/Log Analytics | Lifecycle, clase, retrieval, periodos de retención | Mover datos fríos y evitar ingesta inútil | Restauración, compliance, plazos mínimos |
| Reservations y Savings Plan | Utilización, cobertura, gasto amortizado | Comprar sólo baseline o reducir reserva | Flexibilidad y restricciones |
| Front Door / caché | Hit ratio, latencia origen, conexiones a DB | Cache web/data, reducir load | Coherencia, autenticación, stale data |
| Microservicios | Dependencias, App Gateway, red y tracing | Consolidar piezas con el mismo ciclo | Seguridad y despliegue independiente |

## Disciplina de medición

1. Comparar los mismos periodos del mes para evitar confundir estacionalidad con mejora.
2. Coste real y coste amortizado **no son intercambiables**; indicar cuál se emplea.
3. Una VM detenida o un disco sin `managedBy` aún puede ser válido para recuperación; investigar antes de actuar.
4. Considerar gastos de migration, Azure Monitor ingestión, egress y operación al evaluar cambio de tier/proveedor.
5. Clasificar evidencia A (coste+uso+dueño+SLO), B (alguno falta), C (inventario). Ningún C se declara ahorro cierto.

## Revisión mínima continua

Diaria: SLO y error rate; semanal: costes/Resource Group, máquinas, IPs, discos sin dueño, autoescalado y alertas de costes; mensual: compromisos, Log Analytics, backups, lifecycles y arquitectura. Las alertas deben ser **accionables** y de cardinalidad acotada.
