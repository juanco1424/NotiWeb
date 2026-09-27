# NotiWeb

Plataforma web de noticias tipo periódico donde los usuarios exploran noticias
educativas, tecnológicas, turísticas y comerciales, ven su información detallada e
interactúan mediante favoritos y un formulario de contacto.

Proyecto académico del módulo **Desarrollo Front-end** — Politécnico Grancolombiano (2026).
Entrega 2: prototipo funcional en HTML, CSS y JavaScript (sin frameworks).

- Maquetación aprobada (Figma): <https://www.figma.com/design/IVZrCXsKAFtFpT5TnG2hDr>

## Cómo correr el proyecto (mini tutorial)

> **Importante:** no abras `index.html` con doble clic. Las noticias se cargan con
> `fetch('data/noticias.json')` y los navegadores bloquean `fetch` cuando la página se
> abre como archivo (`file://...`). Verás el mensaje *"No fue posible cargar las
> noticias"*. Siempre hay que usar un servidor local.

### 1. Requisitos

Solo necesitas **una** de estas herramientas (no hay dependencias que instalar ni build):

| Herramienta | Cómo verificar que la tienes |
|---|---|
| Python 3 (viene en macOS y la mayoría de Linux) | `python3 --version` (en Windows: `py --version`) |
| Node.js | `node --version` |
| VS Code con la extensión **Live Server** | Buscar "Live Server" en el panel de extensiones |

### 2. Clonar el repositorio

```bash
git clone <URL-del-repositorio>
cd NotiWeb
```

### 3. Levantar el servidor local

Elige una opción, desde la carpeta raíz del proyecto (donde está `index.html`):

```bash
# Opción A: Python 3 (macOS / Linux)
python3 -m http.server 8000

# Opción A en Windows
py -m http.server 8000

# Opción B: Node.js (no requiere instalar nada, npx lo descarga)
npx serve . -l 8000
```

**Opción C — VS Code:** clic derecho sobre `index.html` → *Open with Live Server*
(abre el navegador automáticamente, normalmente en el puerto 5500).

### 4. Abrir en el navegador

Entra a <http://localhost:8000> en Chrome, Firefox o Edge.
Deberías ver el Home con 3 noticias destacadas cargadas desde el JSON.

### 5. Detener el servidor

En la terminal donde lo levantaste, presiona `Ctrl + C`.

### Problemas comunes

| Síntoma | Causa / solución |
|---|---|
| "No fue posible cargar las noticias" | Abriste el archivo con doble clic. Usa el paso 3. |
| `Address already in use` | El puerto 8000 está ocupado: usa otro, p. ej. `python3 -m http.server 8080`. |
| Los cambios no se ven | Recarga forzada: `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (macOS). |
| Datos raros tras probar Gestión/Favoritos | Borra el `localStorage`: DevTools → *Application* → *Local Storage* → claves `notiweb:*`. |

### Cómo está organizado el código (para seguir desarrollando)

- Cada página HTML carga los scripts en este orden: `datos.js` → `comun.js` → script de la página.
- **Nunca** escribas noticias a mano en el HTML: pídelas con `Datos.obtenerNoticias()`,
  `Datos.obtenerDestacadas()` o `Datos.obtenerPorId(id)`.
- Para pintar una card usa `Comun.crearTarjeta(noticia)`; así todas las páginas comparten el mismo componente.
  En el Listado se usa `Comun.crearTarjeta(noticia, { favorito: true, variante: 'listado' })`
  para mostrar el corazón y el botón "Ver más" del diseño.
- Los favoritos se guardan en `localStorage` (clave `notiweb:favoritos`): usa
  `Datos.esFavorito(id)`, `Datos.alternarFavorito(id)`, `Datos.obtenerFavoritas()` y `Datos.vaciarFavoritos()`.
- En `contenido` de cada noticia, cada elemento es un párrafo (texto) o un subtítulo
  (`{ "subtitulo": "Cómo participar" }`). El campo opcional `pieFoto` es el pie de la imagen.
- Los colores y medidas salen de las variables de `css/base.css` (tokens del Figma): no uses colores sueltos.
- El header y el footer deben copiarse idénticos en cada página nueva, cambiando solo el
  `aria-current="page"` al enlace activo del menú.

## Estructura de carpetas

```
NotiWeb/
├── index.html            # Home
├── noticias.html         # Listado de noticias
├── detalle.html          # Detalle de noticia (detalle.html?id=3)
├── favoritos.html        # Noticias guardadas como favoritas
├── css/
│   ├── base.css          # reset, variables (tokens de diseño), tipografía
│   ├── layout.css        # .wrap, header, footer, grillas, secciones, responsive
│   └── componentes.css   # botones, chips, cards, estados
├── js/
│   ├── datos.js          # carga del JSON + fusión con localStorage + favoritos
│   ├── comun.js          # fecha del header, menú móvil, componente card (con corazón opcional)
│   ├── home.js           # render de noticias destacadas
│   ├── noticias.js       # listado: búsqueda, filtros y paginación
│   ├── detalle.js        # detalle: lee el id de la URL y pinta la noticia
│   └── favoritos.js      # favoritos: lista, quitar uno y quitar todos
├── data/
│   └── noticias.json     # 12 noticias (3 destacadas)
├── img/                  # imágenes de las noticias
└── README.md
```

## Estado del desarrollo

- [x] Home (`index.html`)
- [x] Listado de noticias (`noticias.html`): búsqueda, filtro por categoría, paginación y favoritos
- [x] Detalle de noticia (`detalle.html`): artículo completo por `?id=`, con botones de favoritos sincronizados
- [x] Favoritos (`favoritos.html`): lista guardada en `localStorage`, quitar uno o todos
- [ ] Contacto (`contacto.html`)
- [ ] Gestión — mini CRUD (`gestion.html`)

## Tecnologías

- HTML5 semántico
- CSS3 propio (variables CSS, Grid, Flexbox), sin frameworks
- JavaScript vanilla (ES2020): `fetch`, `localStorage`, `Intl.DateTimeFormat`
