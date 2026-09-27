/* ==========================================================================
   NotiWeb — datos.js
   Capa de acceso a datos. Carga las noticias desde data/noticias.json y las
   fusiona con las creadas por el usuario (localStorage), descartando las
   que fueron eliminadas. Todas las páginas obtienen las noticias desde aquí.
   También guarda la lista de favoritos del usuario.
   ========================================================================== */

const Datos = (() => {
  const URL_JSON = 'data/noticias.json';
  const CLAVE_CREADAS = 'notiweb:noticias';     // noticias creadas en Gestión
  const CLAVE_ELIMINADAS = 'notiweb:eliminadas'; // ids ocultos (el JSON es de solo lectura)
  const CLAVE_FAVORITOS = 'notiweb:favoritos';   // ids marcados como favoritos

  // Guarda la promesa para no repetir el fetch si se pide varias veces
  let cache = null;

  /**
   * Lee un arreglo guardado en localStorage de forma segura.
   * Si la clave no existe o el contenido está dañado, devuelve [].
   */
  function leerLista(clave) {
    try {
      const valor = JSON.parse(localStorage.getItem(clave));
      return Array.isArray(valor) ? valor : [];
    } catch {
      return [];
    }
  }

  /**
   * Devuelve todas las noticias visibles: JSON + creadas − eliminadas,
   * ordenadas de la más reciente a la más antigua.
   */
  function obtenerNoticias() {
    if (!cache) {
      cache = fetch(URL_JSON)
        .then((respuesta) => {
          if (!respuesta.ok) {
            throw new Error(`No se pudo cargar ${URL_JSON} (${respuesta.status})`);
          }
          return respuesta.json();
        })
        .then((base) => {
          const eliminadas = leerLista(CLAVE_ELIMINADAS);
          return [...base, ...leerLista(CLAVE_CREADAS)]
            .filter((noticia) => !eliminadas.includes(noticia.id))
            .sort((a, b) => b.fecha.localeCompare(a.fecha));
        })
        .catch((error) => {
          cache = null; // permite reintentar en una próxima llamada
          throw error;
        });
    }
    return cache;
  }

  /** Devuelve las noticias marcadas como destacadas (máximo `limite`). */
  async function obtenerDestacadas(limite = 3) {
    const noticias = await obtenerNoticias();
    return noticias.filter((noticia) => noticia.destacada === true).slice(0, limite);
  }

  /** Busca una noticia por su id numérico. Devuelve undefined si no existe. */
  async function obtenerPorId(id) {
    const noticias = await obtenerNoticias();
    return noticias.find((noticia) => noticia.id === Number(id));
  }

  /* ------------------------------------------------------------------------
     Favoritos: lista de ids guardada en localStorage
     ------------------------------------------------------------------------ */

  /** Devuelve los ids de las noticias marcadas como favoritas. */
  function obtenerIdsFavoritos() {
    return leerLista(CLAVE_FAVORITOS).map(Number);
  }

  /** Indica si la noticia con ese id está en favoritos. */
  function esFavorito(id) {
    return obtenerIdsFavoritos().includes(Number(id));
  }

  /**
   * Agrega o quita una noticia de favoritos.
   * @returns {boolean} true si quedó como favorita, false si se quitó.
   */
  function alternarFavorito(id) {
    const idNumerico = Number(id);
    const favoritos = obtenerIdsFavoritos();
    const yaEsta = favoritos.includes(idNumerico);
    const nuevos = yaEsta
      ? favoritos.filter((favorito) => favorito !== idNumerico)
      : [...favoritos, idNumerico];

    try {
      localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(nuevos));
    } catch (error) {
      console.error('No se pudo guardar el favorito', error);
      return yaEsta; // no cambió nada
    }
    return !yaEsta;
  }

  /** Quita todas las noticias de favoritos. */
  function vaciarFavoritos() {
    try {
      localStorage.removeItem(CLAVE_FAVORITOS);
    } catch (error) {
      console.error('No se pudieron borrar los favoritos', error);
    }
  }

  /** Devuelve las noticias completas que están en favoritos. */
  async function obtenerFavoritas() {
    const ids = obtenerIdsFavoritos();
    const noticias = await obtenerNoticias();
    return noticias.filter((noticia) => ids.includes(noticia.id));
  }

  return {
    obtenerNoticias,
    obtenerDestacadas,
    obtenerPorId,
    esFavorito,
    alternarFavorito,
    vaciarFavoritos,
    obtenerFavoritas,
  };
})();
