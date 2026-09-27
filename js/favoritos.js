/* ==========================================================================
   NotiWeb — favoritos.js
   Página de favoritos: muestra las noticias que el usuario marcó con el
   corazón (guardadas en localStorage por datos.js).
   - Al quitar el corazón, la card desaparece y se actualiza el contador.
   - "Quitar todos" vacía la lista después de confirmar.
   - Si la lista cambia en otra pestaña, la página se actualiza sola.
   Depende de: datos.js (Datos) y comun.js (Comun).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const grilla = document.getElementById('grilla-favoritos');
  const contador = document.getElementById('contador');
  const botonVaciar = document.getElementById('vaciar-favoritos');
  if (!grilla) return;

  /** Texto del contador: "1 noticia guardada" / "3 noticias guardadas". */
  function actualizarContador(total) {
    contador.textContent =
      total === 1 ? '1 noticia guardada' : `${total} noticias guardadas`;
    botonVaciar.hidden = total === 0;
  }

  /** Estado vacío: invita a ir al listado a guardar noticias. */
  function mostrarVacio() {
    const estado = Comun.crear('div', 'estado estado--vacio');
    estado.setAttribute('role', 'status');

    const enlace = Comun.crear('a', 'btn btn--primary', 'Explorar noticias');
    enlace.href = 'noticias.html';

    estado.append(
      Comun.crear('h2', 'estado__titulo', 'Todavía no tienes favoritos'),
      Comun.crear(
        'p',
        '',
        'Toca el corazón de cualquier noticia para guardarla y leerla después.'
      ),
      enlace
    );
    grilla.replaceChildren(estado);
    actualizarContador(0);
  }

  /** Al quitar el corazón en una card, se retira de la grilla. */
  function alCambiarFavorito(activo, card) {
    if (activo || !card) return;
    card.remove();

    const restantes = grilla.querySelectorAll('.card').length;
    if (restantes === 0) {
      mostrarVacio();
    } else {
      actualizarContador(restantes);
    }
  }

  /** Carga las favoritas y pinta la grilla. */
  async function pintarFavoritos() {
    grilla.setAttribute('aria-busy', 'true');

    try {
      const favoritas = await Datos.obtenerFavoritas();

      if (favoritas.length === 0) {
        mostrarVacio();
        return;
      }

      grilla.replaceChildren(
        ...favoritas.map((noticia) =>
          Comun.crearTarjeta(noticia, {
            favorito: true,
            variante: 'listado',
            alCambiarFavorito,
          })
        )
      );
      actualizarContador(favoritas.length);
    } catch (error) {
      console.error(error);
      contador.textContent = '';
      Comun.mostrarEstado(
        grilla,
        'No fue posible cargar tus favoritos. Abre el proyecto desde un servidor local (ver README).',
        true
      );
    } finally {
      grilla.setAttribute('aria-busy', 'false');
    }
  }

  // Quitar todos (con confirmación para evitar borrados accidentales)
  botonVaciar.addEventListener('click', () => {
    const confirmado = window.confirm('¿Quieres quitar todas las noticias de tus favoritos?');
    if (!confirmado) return;
    Datos.vaciarFavoritos();
    mostrarVacio();
  });

  // Si se marcan o quitan favoritos en otra pestaña, se vuelve a pintar
  window.addEventListener('storage', (evento) => {
    if (evento.key === null || evento.key === 'notiweb:favoritos') pintarFavoritos();
  });

  Comun.mostrarEstado(grilla, 'Cargando tus favoritos…');
  pintarFavoritos();
});
