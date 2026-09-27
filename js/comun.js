/* ==========================================================================
   NotiWeb — comun.js
   Comportamiento compartido por todas las páginas:
   - Fecha actual en la barra superior del header.
   - Apertura/cierre del menú en móvil.
   - Componente de card de noticia (reutilizado en Home, Listado, Detalle y Favoritos),
     con botón opcional de favoritos.
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

  const formatoFechaArticulo = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  /** Formatea una fecha ISO como "13 de septiembre de 2026" (detalle). */
  function fechaLarga(iso) {
    return formatoFechaArticulo.format(parsearFecha(iso));
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

  /** URL de la vista de detalle de una noticia. */
  function urlDetalle(id) {
    return `detalle.html?id=${encodeURIComponent(id)}`;
  }

  /**
   * Botón circular con corazón para agregar/quitar una noticia de favoritos.
   * Usa aria-pressed para que los lectores de pantalla anuncien su estado.
   * @param {Function} [alCambiar]  Se llama con (activo, card) después de cada clic.
   */
  function crearBotonFavorito(noticia, alCambiar) {
    const boton = crear('button', 'card__fav');
    boton.type = 'button';
    boton.innerHTML = ICONO_CORAZON;

    const pintar = (activo) => {
      boton.setAttribute('aria-pressed', String(activo));
      boton.setAttribute(
        'aria-label',
        activo ? `Quitar de favoritos: ${noticia.titulo}` : `Agregar a favoritos: ${noticia.titulo}`
      );
    };

    pintar(Datos.esFavorito(noticia.id));
    boton.addEventListener('click', () => {
      const activo = Datos.alternarFavorito(noticia.id);
      pintar(activo);
      if (typeof alCambiar === 'function') alCambiar(activo, boton.closest('.card'));
    });
    return boton;
  }

  /**
   * Componente card de noticia: imagen, categoría, título, resumen y
   * enlace "Ver más" hacia el detalle.
   *
   * @param {object} noticia   Objeto con la forma de data/noticias.json
   * @param {object} [opciones]
   * @param {boolean} [opciones.favorito=false]  Muestra el corazón de favoritos sobre la imagen.
   * @param {string}  [opciones.variante='home'] 'home': pie con fecha y enlace "Ver más →".
   *                                              'listado': botón "Ver más" (diseño del Listado).
   * @param {Function} [opciones.alCambiarFavorito] Callback (activo, card) al usar el corazón.
   * @returns {HTMLElement} <article class="card">
   */
  function crearTarjeta(noticia, opciones) {
    // Array.map pasa el índice como 2.º argumento: si no es un objeto, se ignora
    const { favorito = false, variante = 'home', alCambiarFavorito } =
      opciones && typeof opciones === 'object' ? opciones : {};
    const url = urlDetalle(noticia.id);

    const card = crear('article', 'card');

    // Imagen (si falla la carga queda visible el bloque marcador gris)
    const media = crear('div', 'card__media');
    const img = document.createElement('img');
    img.src = noticia.imagen;
    img.alt = noticia.titulo;
    img.loading = 'lazy';
    img.addEventListener('error', () => img.remove(), { once: true });
    media.append(img);
    if (favorito) media.append(crearBotonFavorito(noticia, alCambiarFavorito));

    // Cuerpo
    const cuerpo = crear('div', 'card__body');
    const titulo = crear('h3', 'card__title');
    const enlaceTitulo = crear('a', '', noticia.titulo);
    enlaceTitulo.href = url;
    titulo.append(enlaceTitulo);

    cuerpo.append(
      crear('span', 'chip', noticia.categoria),
      titulo,
      crear('p', 'card__text', noticia.resumen)
    );

    if (variante === 'listado') {
      // Diseño del Listado: botón "Ver más" con borde
      const verMas = crear('a', 'btn btn--ghost card__btn', 'Ver más');
      verMas.href = url;
      verMas.setAttribute('aria-label', `Ver más: ${noticia.titulo}`);
      cuerpo.append(verMas);
    } else {
      // Diseño del Home: fecha a la izquierda y "Ver más →" a la derecha
      const pie = crear('div', 'card__footer');
      const meta = crear('time', 'card__meta', fechaCorta(noticia.fecha));
      meta.dateTime = noticia.fecha;

      const verMas = crear('a', 'card__more', 'Ver más');
      verMas.href = url;
      verMas.setAttribute('aria-label', `Ver más: ${noticia.titulo}`);
      verMas.insertAdjacentHTML('beforeend', ICONO_FLECHA);
      pie.append(meta, verMas);
      cuerpo.append(pie);
    }

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

  // Icono SVG de corazón: el relleno se activa por CSS con [aria-pressed="true"]
  const ICONO_CORAZON =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.4 3.8 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4' +
    'c3.4 0 5.5 3.4 4.4 6.7C19.5 15.4 12 20 12 20Z"/></svg>';

  // Inicialización común al cargar cualquier página
  document.addEventListener('DOMContentLoaded', () => {
    pintarFechaActual();
    iniciarMenuMovil();
  });

  return {
    crear,
    crearTarjeta,
    mostrarEstado,
    fechaCorta,
    fechaLarga,
    urlDetalle,
    iconos: { flecha: ICONO_FLECHA, corazon: ICONO_CORAZON },
  };
})();
