---
name: web-sprites
description: Crear e integrar sprites 2D y personajes animados en webs, con hojas de fotogramas, reproducción accesible y coordinación entre personajes.
---

# Sprites para web

Crea un personaje legible a su tamaño real, con animación e integración adecuadas
para la web existente. Un sprite es un elemento gráfico 2D: no implica pixel art
ni una hoja PNG. Elige la representación según el uso: atlas raster para imágenes
ya dibujadas, SVG o capas editables para arte procedural, Canvas para muchos
objetos y el motor 3D existente cuando la experiencia necesite cámaras, iluminación
o interacción espacial.

## Inspeccionar antes de generar

Localiza el renderizador, la fuente editable, el reloj de animación, los puntos de
anclaje y el estado de interacción. Conserva el personaje y el comportamiento
existentes salvo que se pida sustituirlos. Distingue el arte fuente de las vistas
previas exportadas. Define tamaño, fondos, emociones y función del personaje.
Las medidas, paleta y cantidad de fotogramas de un proyecto no son requisitos
universales.

## Crear el arte y los clips

Empieza con una silueta y una pose de reposo reconocibles al tamaño final. Mantén
la paleta, los contornos, las proporciones y los accesorios entre fotogramas.
Una imagen generada puede servir de concepto; reducirla no demuestra limpieza de
píxeles ni continuidad de la animación.

Para un atlas regular registra ancho y alto de celda, columnas y una fila por
clip con `name`, `frames`, `fps`, `loop` y `staticFrame`. Si los tamaños varían,
usa rectángulos explícitos. Reserva margen para saltos y efectos. El rectángulo
origen de un fotograma es `(columna * ancho, fila * alto, ancho, alto)`.

Usa pocos cambios para expresar respiración, pensamiento o reacción. Deja
transparentes las celdas sin usar. Revisa los fotogramas y reproduce los clips:
unos metadatos válidos no acreditan calidad visual.

## Integrar en la página

Reutiliza el reloj del proyecto cuando exista. Repite cada bucle según su número
de fotogramas y detén los clips de una sola ejecución en el último. Pausa los
temporizadores fuera de pantalla y en pestañas ocultas; con movimiento reducido,
muestra la pose estática. Limpia recursos al desmontar y decide cómo reanudar
sin reiniciar por accidente una animación terminada.

Separa dibujo, desplazamiento, mensajes y estado de la página. Reserva un espacio
estable. Recorta el rectángulo correcto y comprueba el escalado: los múltiplos
enteros de píxeles físicos son un buen punto de partida. Prueba tamaño CSS,
densidad y zoom. `image-rendering: pixelated` no garantiza píxeles uniformes en
todos los escalados fraccionarios.

Con dos personajes, conserva su identidad y estado, coordina los turnos de voz y
presupuesta el diseño y las descargas conjuntas. No compartas una única emoción
o mensaje global entre actores independientes. Si una escena sustituye a la
mascota flotante, restáurala al salir o desmontarse. Carga solo los personajes
presentes, sin conceptos de alta resolución ni GIF de previsualización.

Oculta las figuras decorativas a los lectores de pantalla. Una figura interactiva
necesita un botón nativo etiquetado, foco de teclado y texto para sus mensajes.
La información debe poder leerse sin animación.

## Verificar y entregar

Prueba cambios de clip, finalización de animaciones, pestaña oculta, movimiento
reducido, limpieza al desmontar e independencia entre personajes. Revisa móvil,
contraste, efectos en los bordes, tamaño de descarga y comportamiento de la mascota
existente. Comprueba la integración con la compilación real del proyecto.

Entrega el arte editable o su estado como fuente, los recursos de ejecución,
metadatos e instrucciones. Indica qué has comprobado. Exportar imágenes no
equivale a integrar un componente.

El [validador opcional](../../scripts/validate_atlas.py) comprueba atlas PNG RGBA de
8 bits sin entrelazado y una cuadrícula JSON regular, sin dependencias externas:

```sh
python scripts/validate_atlas.py sheet.png sheet.json
```

Decodifica recursos externos en aislamiento, sin red ni secretos. El script limita
archivos y descompresión, comprueba sumas de verificación, límites de fotogramas y
transparencia de celdas sin usar. No evalúa continuidad artística.

Consulta el [caso AgentRepo](../../references/agentrepo.md) como ejemplo SVG/raster
y las [notas de renderizado](../../references/rendering.md) para elegir una técnica
y explicar el escalado.
