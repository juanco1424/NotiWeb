/* ==========================================================================
   NotiWeb — detalle.js
   Detalle de noticia: lee el id de la URL (detalle.html?id=3), busca la
   noticia en el JSON y pinta el artículo completo según el diseño de Figma:
   - Banda superior: migas, categoría, título, resumen, datos y botones.
   - Imagen representativa con pie de foto.
   - Cuerpo con párrafos (y subtítulos opcionales).
   - Caja final para guardar la noticia en favoritos.
   Los dos botones de favoritos están sincronizados entre sí.
   Si el id no existe, muestra un mensaje con enlace al listado.
   Depende de: datos.js (Datos) y comun.js (Comun).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.getElementById('detalle');
  if (!contenedor) return;

  const { crear } = Comun;
  const id = new URLSearchParams(window.location.search).get('id');

  // Icono de sobre para "Contactar redacción" (misma grilla que el footer)
  const ICONO_CORREO =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>';

  /* ------------------------------------------------------------------------
     Piezas del artículo
     ------------------------------------------------------------------------ */

  /** Migas de pan: Inicio / Noticias / <categoría> */
  function crearMigas(noticia) {
    const nav = crear('nav', 'migas');
    nav.setAttribute('aria-label', 'Migas de pan');
    const lista = crear('ol', 'migas__lista');

    const enlaces = [
      ['Inicio', 'index.html'],
      ['Noticias', 'noticias.html'],
    ];
    if (noticia) {
      enlaces.push([
        noticia.categoria,
        `noticias.html?categoria=${encodeURIComponent(noticia.categoria)}`,
      ]);
    }

    enlaces.forEach(([texto, href]) => {
      const item = crear('li');
      const enlace = crear('a', '', texto);
      enlace.href = href;
      item.append(enlace);
      lista.append(item);
    });

    nav.append(lista);
    return nav;
  }

  /** Enlace con estilo de botón y un icono opcional antes del texto. */
  function crearEnlaceBoton(clase, texto, href, icono) {
    const enlace = crear('a', clase, texto);
    enlace.href = href;
    if (icono) enlace.insertAdjacentHTML('afterbegin', icono);
    return enlace;
  }

  /** Botón de favoritos: su texto cambia según el estado. */
  function crearBotonFavorito(textoInactivo, textoActivo) {
    const boton = crear('button', 'btn btn--primary btn--fav');
    boton.type = 'button';
    boton.pintar = (activo) => {
      boton.setAttribute('aria-pressed', String(activo));
      boton.innerHTML = Comun.iconos.corazon;
      boton.append(activo ? textoActivo : textoInactivo);
    };
    return boton;
  }

  /**
   * Devuelve los bloques del cuerpo. Cada elemento de "contenido" puede ser:
   * - un texto (párrafo),
   * - un objeto { "subtitulo": "..." } (título de sección dentro del artículo).
   * Las noticias creadas en Gestión pueden traer el contenido como un solo
   * texto con saltos de línea: se divide en párrafos.
   */
  function crearBloques(noticia) {
    let contenido = noticia.contenido;
    if (typeof contenido === 'string') {
      contenido = contenido.split(/\n+/).map((parrafo) => parrafo.trim()).filter(Boolean);
    }
    if (!Array.isArray(contenido) || contenido.length === 0) {
      contenido = [noticia.resumen];
    }

    return contenido.map((bloque) => {
      if (bloque && typeof bloque === 'object' && bloque.subtitulo) {
        return crear('h2', '', bloque.subtitulo);
      }
      return crear('p', '', String(bloque));
    });
  }

  /** Construye el artículo completo de la noticia. */
  function pintarNoticia(noticia) {
    document.title = `${noticia.titulo} | NotiWeb`;

    const articulo = crear('article');
    articulo.setAttribute('aria-labelledby', 'titulo-articulo');

    // ---------- Banda superior ----------
    const titulo = crear('h1', 'articulo__title', noticia.titulo);
    titulo.id = 'titulo-articulo';

    const datos = crear('p', 'articulo__datos');
    if (noticia.autor) datos.append(crear('span', '', `Por ${noticia.autor}`));
    const fecha = crear('time', '', Comun.fechaLarga(noticia.fecha));
    fecha.dateTime = noticia.fecha;
    datos.append(fecha);
    if (noticia.minutosLectura) {
      datos.append(crear('span', '', `${noticia.minutosLectura} min de lectura`));
    }

    const favoritoSuperior = crearBotonFavorito('Agregar a favoritos', 'En tus favoritos');
    const botones = crear('div', 'articulo__botones');
    botones.append(
      favoritoSuperior,
      crearEnlaceBoton('btn btn--ghost', 'Contactar redacción', 'contacto.html', ICONO_CORREO)
    );

    const cabecera = crear('header', 'articulo-head');
    const cabeceraInterna = crear('div', 'narrow articulo-head__inner');
    cabeceraInterna.append(
      crearMigas(noticia),
      crear('span', 'chip', noticia.categoria),
      titulo,
      crear('p', 'articulo__lead', noticia.resumen),
      datos,
      botones
    );
    cabecera.append(cabeceraInterna);

    // ---------- Imagen con pie de foto ----------
    const figura = crear('figure', 'wrap');
    const media = crear('div', 'articulo__media', 'Imagen representativa');
    if (noticia.imagen) {
      const img = document.createElement('img');
      img.src = noticia.imagen;
      img.alt = noticia.titulo;
      img.addEventListener('error', () => img.remove(), { once: true });
      media.append(img);
    }
    figura.append(
      media,
      crear('figcaption', 'articulo__pie', noticia.pieFoto || 'Imagen representativa de la noticia.')
    );

    // ---------- Cuerpo ----------
    const cuerpo = crear('div', 'articulo__cuerpo');
    cuerpo.append(...crearBloques(noticia));

    // ---------- Caja final ----------
    const textoCierre = crear('p', 'articulo__cierre-texto');
    textoCierre.setAttribute('aria-live', 'polite');
    const favoritoInferior = crearBotonFavorito('Guardar en favoritos', 'Guardada en favoritos');

    const botonesCierre = crear('div', 'articulo__cierre-botones');
    botonesCierre.append(
      crearEnlaceBoton('btn btn--ghost', 'Volver al listado', 'noticias.html'),
      favoritoInferior
    );

    const cierre = crear('aside', 'articulo__cierre');
    cierre.setAttribute('aria-label', 'Guardar noticia');
    cierre.append(textoCierre, botonesCierre);

    const columna = crear('div', 'narrow');
    columna.append(cuerpo, cierre);

    const principal = crear('div', 'articulo');
    principal.append(figura, columna);

    // ---------- Favoritos sincronizados ----------
    function pintarFavorito(activo) {
      favoritoSuperior.pintar(activo);
      favoritoInferior.pintar(activo);
      textoCierre.textContent = activo
        ? 'Guardaste esta noticia. La encuentras en Favoritos.'
        : '¿Te interesó esta noticia? Guárdala para leerla después.';
    }

    [favoritoSuperior, favoritoInferior].forEach((boton) => {
      boton.addEventListener('click', () => pintarFavorito(Datos.alternarFavorito(noticia.id)));
    });
    pintarFavorito(Datos.esFavorito(noticia.id));

    articulo.append(cabecera, principal);
    contenedor.replaceChildren(articulo);
  }

  /** Estado cuando falta el id o no existe una noticia con ese id. */
  function pintarNoEncontrada() {
    document.title = 'Noticia no encontrada | NotiWeb';

    const seccion = crear('section', 'articulo-head articulo-head--vacio');
    const interna = crear('div', 'narrow articulo-head__inner');
    const botones = crear('div', 'articulo__botones');
    botones.append(crearEnlaceBoton('btn btn--primary', 'Ir al listado de noticias', 'noticias.html'));

    interna.append(
      crearMigas(null),
      crear('h1', 'articulo__title', 'No encontramos esta noticia'),
      crear(
        'p',
        'articulo__lead',
        'Puede que el enlace esté incompleto o que la noticia haya sido eliminada. Revisa el listado para encontrar otras noticias.'
      ),
      botones
    );
    seccion.append(interna);
    contenedor.replaceChildren(seccion);
  }

  /* ------------------------------------------------------------------------
     Carga inicial
     ------------------------------------------------------------------------ */
  try {
    const noticia = id ? await Datos.obtenerPorId(id) : undefined;
    if (noticia) {
      pintarNoticia(noticia);
    } else {
      pintarNoEncontrada();
    }
  } catch (error) {
    console.error(error);
    const seccion = crear('section', 'articulo-head');
    const interna = crear('div', 'narrow articulo-head__inner');
    const mensaje = crear(
      'p',
      'estado estado--error',
      'No fue posible cargar la noticia. Abre el proyecto desde un servidor local (ver README).'
    );
    mensaje.setAttribute('role', 'alert');
    interna.append(mensaje);
    seccion.append(interna);
    contenedor.replaceChildren(seccion);
  } finally {
    contenedor.setAttribute('aria-busy', 'false');
  }
});
