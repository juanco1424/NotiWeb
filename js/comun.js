/* ==========================================================================
   NotiWeb — comun.js
   Comportamiento compartido por todas las páginas:
   - Fecha actual en la barra superior del header.
   - Apertura/cierre del menú en móvil.
   - Componente de card de noticia (reutilizado en Home, Listado y Favoritos).
   ========================================================================== */

const Comun = (() => {
  // Formateadores en español (Colombia)
  const formatoFechaLarga = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formatoFechaCorta = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  /** Convierte "2026-09-13" en fecha local (evita el desfase por zona horaria). */
  function parsearFecha(iso) {
    const [anio, mes, dia] = iso.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
  }

  /** Formatea una fecha ISO como "13 sept 2026". */
  function fechaCorta(iso) {
    return formatoFechaCorta.format(parsearFecha(iso));
  }

  /** Escribe la fecha de hoy en la barra superior ("domingo, 13 de septiembre de 2026"). */
  function pintarFechaActual() {
    const nodo = document.querySelector('[data-fecha-actual]');
    if (!nodo) return;
    const hoy = new Date();
    nodo.textContent = formatoFechaLarga.format(hoy);
    nodo.setAttribute('datetime', hoy.toISOString().slice(0, 10));
  }

  /** Activa el botón hamburguesa que muestra/oculta el menú en pantallas pequeñas. */
  function iniciarMenuMovil() {
    const boton = document.querySelector('.nav__toggle');
    const menu = document.getElementById('menu-principal');
    if (!boton || !menu) return;

    boton.addEventListener('click', () => {
      const abierto = menu.classList.toggle('is-open');
      boton.setAttribute('aria-expanded', String(abierto));
      boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
  }

  /**
   * Crea un elemento con clase y texto opcionales.
   * Se usa textContent (no innerHTML) para que el contenido creado por el
   * usuario en Gestión no pueda inyectar HTML.
   */
  function crear(etiqueta, clase, texto) {
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  }

  /**
   * Componente card de noticia: imagen, categoría, título, resumen,
   * metadatos y enlace "Ver más" hacia el detalle.
   * @param {object} noticia  Objeto con la forma de data/noticias.json
   * @returns {HTMLElement}   <article class="card">
   */
  function crearTarjeta(noticia) {
    const urlDetalle = `detalle.html?id=${encodeURIComponent(noticia.id)}`;

    const card = crear('article', 'card');

    // Imagen (si falla la carga queda visible el bloque marcador gris)
    const media = crear('div', 'card__media');
    const img = document.createElement('img');
    img.src = noticia.imagen;
    img.alt = noticia.titulo;
    img.loading = 'lazy';
    img.addEventListener('error', () => img.remove(), { once: true });
    media.append(img);

    // Cuerpo
    const cuerpo = crear('div', 'card__body');
    const titulo = crear('h3', 'card__title');
    const enlaceTitulo = crear('a', '', noticia.titulo);
    enlaceTitulo.href = urlDetalle;
    titulo.append(enlaceTitulo);

    const pie = crear('div', 'card__footer');
    const meta = crear('time', 'card__meta', fechaCorta(noticia.fecha));
    meta.dateTime = noticia.fecha;

    const verMas = crear('a', 'card__more', 'Ver más');
    verMas.href = urlDetalle;
    verMas.setAttribute('aria-label', `Ver más: ${noticia.titulo}`);
    verMas.insertAdjacentHTML('beforeend', ICONO_FLECHA);
    pie.append(meta, verMas);

    cuerpo.append(
      crear('span', 'chip', noticia.categoria),
      titulo,
      crear('p', 'card__text', noticia.resumen),
      pie
    );

    card.append(media, cuerpo);
    return card;
  }

  /** Pinta un mensaje (cargando, vacío o error) ocupando toda la grilla. */
  function mostrarEstado(contenedor, mensaje, esError = false) {
    const estado = crear('p', esError ? 'estado estado--error' : 'estado', mensaje);
    estado.setAttribute('role', esError ? 'alert' : 'status');
    contenedor.replaceChildren(estado);
  }

  // Icono SVG de flecha (trazo 1.6, grilla de 16px)
  const ICONO_FLECHA =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3 8h10M9 4l4 4-4 4"/></svg>';

  // Inicialización común al cargar cualquier página
  document.addEventListener('DOMContentLoaded', () => {
    pintarFechaActual();
    iniciarMenuMovil();
  });

  return { crearTarjeta, mostrarEstado, fechaCorta };
})();
