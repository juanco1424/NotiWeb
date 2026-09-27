/* ==========================================================================
   NotiWeb — noticias.js
   Listado de noticias: pinta todas las noticias del JSON con
   - búsqueda por texto (título y resumen),
   - filtro por categoría,
   - paginación de 6 noticias por página,
   - corazón de favoritos en cada card.
   El estado (categoría, búsqueda y página) se guarda en la URL, así al volver
   desde el detalle el usuario encuentra el listado como lo dejó.
   Depende de: datos.js (Datos) y comun.js (Comun).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const POR_PAGINA = 6;
  const TODAS = 'Todas';
  // Orden de los filtros según el diseño de Figma
  const CATEGORIAS_BASE = ['Educación', 'Tecnología', 'Turismo', 'Comercial'];

  const grilla = document.getElementById('grilla-noticias');
  const filtros = document.getElementById('filtros');
  const contador = document.getElementById('contador');
  const paginacion = document.getElementById('paginacion');
  const buscador = document.getElementById('buscar-noticia');
  if (!grilla || !filtros || !paginacion || !buscador) return;

  // Estado inicial leído de la URL (?categoria=Turismo&q=becas&pagina=2)
  const parametros = new URLSearchParams(window.location.search);
  const estado = {
    categoria: parametros.get('categoria') || TODAS,
    texto: parametros.get('q') || '',
    pagina: Math.max(1, parseInt(parametros.get('pagina'), 10) || 1),
  };
  buscador.value = estado.texto;

  let noticias = [];

  /* ------------------------------------------------------------------------
     Utilidades
     ------------------------------------------------------------------------ */

  /** Pasa a minúsculas y quita tildes: "Tecnología" → "tecnologia". */
  function normalizar(texto) {
    return String(texto)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /** Aplica categoría y búsqueda sobre todas las noticias. */
  function filtrarNoticias() {
    const busqueda = normalizar(estado.texto.trim());
    return noticias.filter((noticia) => {
      const coincideCategoria =
        estado.categoria === TODAS || noticia.categoria === estado.categoria;
      const coincideTexto =
        !busqueda || normalizar(`${noticia.titulo} ${noticia.resumen}`).includes(busqueda);
      return coincideCategoria && coincideTexto;
    });
  }

  /** Refleja el estado en la URL sin recargar la página. */
  function actualizarUrl() {
    const nuevos = new URLSearchParams();
    if (estado.categoria !== TODAS) nuevos.set('categoria', estado.categoria);
    if (estado.texto.trim()) nuevos.set('q', estado.texto.trim());
    if (estado.pagina > 1) nuevos.set('pagina', estado.pagina);
    const consulta = nuevos.toString();
    history.replaceState(null, '', consulta ? `?${consulta}` : window.location.pathname);
  }

  /* ------------------------------------------------------------------------
     Render
     ------------------------------------------------------------------------ */

  /** Crea los botones de categoría (Todas + las del JSON, en el orden del diseño). */
  function pintarFiltros() {
    const extras = [...new Set(noticias.map((noticia) => noticia.categoria))]
      .filter((categoria) => !CATEGORIAS_BASE.includes(categoria));
    const categorias = [TODAS, ...CATEGORIAS_BASE, ...extras];

    // Si la URL trae una categoría que no existe, se vuelve a "Todas"
    if (!categorias.includes(estado.categoria)) estado.categoria = TODAS;

    const botones = categorias.map((categoria) => {
      const boton = Comun.crear('button', 'filtro', categoria);
      boton.type = 'button';
      boton.dataset.categoria = categoria;
      boton.setAttribute('aria-pressed', String(categoria === estado.categoria));
      return boton;
    });
    filtros.replaceChildren(...botones);
  }

  /** Crea un botón de la paginación. */
  function crearBotonPagina(contenido, pagina, { actual = false, deshabilitado = false, etiqueta } = {}) {
    const boton = Comun.crear('button', 'paginacion__btn');
    boton.type = 'button';
    boton.dataset.pagina = pagina;
    boton.innerHTML = contenido;
    boton.disabled = deshabilitado;
    if (actual) boton.setAttribute('aria-current', 'page');
    if (etiqueta) boton.setAttribute('aria-label', etiqueta);
    return boton;
  }

  function pintarPaginacion(totalPaginas) {
    if (totalPaginas <= 1) {
      paginacion.hidden = true;
      paginacion.replaceChildren();
      return;
    }

    const flechaIzquierda = Comun.iconos.flecha.replace('<svg', '<svg style="transform: scaleX(-1)"');
    const botones = [
      crearBotonPagina(flechaIzquierda, estado.pagina - 1, {
        deshabilitado: estado.pagina === 1,
        etiqueta: 'Página anterior',
      }),
    ];

    for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
      botones.push(
        crearBotonPagina(String(pagina), pagina, {
          actual: pagina === estado.pagina,
          etiqueta: `Página ${pagina}`,
        })
      );
    }

    botones.push(
      crearBotonPagina(Comun.iconos.flecha, estado.pagina + 1, {
        deshabilitado: estado.pagina === totalPaginas,
        etiqueta: 'Página siguiente',
      })
    );

    paginacion.replaceChildren(...botones);
    paginacion.hidden = false;
  }

  /** Pinta contador, cards y paginación según el estado actual. */
  function pintarListado() {
    const resultado = filtrarNoticias();
    const totalPaginas = Math.max(1, Math.ceil(resultado.length / POR_PAGINA));
    estado.pagina = Math.min(estado.pagina, totalPaginas);

    contador.textContent =
      resultado.length === 1
        ? '1 noticia encontrada'
        : `${resultado.length} noticias encontradas`;

    if (resultado.length === 0) {
      Comun.mostrarEstado(
        grilla,
        'No hay noticias que coincidan con tu búsqueda. Prueba con otra palabra o elige la categoría "Todas".'
      );
    } else {
      const inicio = (estado.pagina - 1) * POR_PAGINA;
      const pagina = resultado.slice(inicio, inicio + POR_PAGINA);
      grilla.replaceChildren(
        ...pagina.map((noticia) =>
          Comun.crearTarjeta(noticia, { favorito: true, variante: 'listado' })
        )
      );
    }

    pintarPaginacion(totalPaginas);
    actualizarUrl();
  }

  /* ------------------------------------------------------------------------
     Eventos
     ------------------------------------------------------------------------ */

  // Filtro por categoría (un solo listener para todos los botones)
  filtros.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.filtro');
    if (!boton) return;

    estado.categoria = boton.dataset.categoria;
    estado.pagina = 1;
    filtros.querySelectorAll('.filtro').forEach((filtro) => {
      filtro.setAttribute('aria-pressed', String(filtro === boton));
    });
    pintarListado();
  });

  // Búsqueda: espera 250 ms después de la última tecla para no repintar en cada letra
  let temporizador;
  buscador.addEventListener('input', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      estado.texto = buscador.value;
      estado.pagina = 1;
      pintarListado();
    }, 250);
  });

  // Paginación
  paginacion.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.paginacion__btn');
    if (!boton || boton.disabled) return;

    estado.pagina = Number(boton.dataset.pagina);
    pintarListado();
    // Sube al inicio de los resultados para ver la nueva página
    grilla.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ------------------------------------------------------------------------
     Carga inicial
     ------------------------------------------------------------------------ */
  grilla.setAttribute('aria-busy', 'true');
  Comun.mostrarEstado(grilla, 'Cargando noticias…');

  try {
    noticias = await Datos.obtenerNoticias();
    pintarFiltros();
    pintarListado();
  } catch (error) {
    console.error(error);
    contador.textContent = '';
    Comun.mostrarEstado(
      grilla,
      'No fue posible cargar las noticias. Abre el proyecto desde un servidor local (ver README).',
      true
    );
  } finally {
    grilla.setAttribute('aria-busy', 'false');
  }
});
