/* ==========================================================================
   NotiWeb — home.js
   Página de inicio: pinta las 3 noticias destacadas a partir del JSON.
   Depende de: datos.js (Datos) y comun.js (Comun).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const grilla = document.getElementById('grilla-destacadas');
  if (!grilla) return;

  grilla.setAttribute('aria-busy', 'true');
  Comun.mostrarEstado(grilla, 'Cargando noticias destacadas…');

  try {
    const destacadas = await Datos.obtenerDestacadas(3);

    if (destacadas.length === 0) {
      Comun.mostrarEstado(grilla, 'Por ahora no hay noticias destacadas.');
      return;
    }

    grilla.replaceChildren(...destacadas.map(Comun.crearTarjeta));
  } catch (error) {
    console.error(error);
    Comun.mostrarEstado(
      grilla,
      'No fue posible cargar las noticias. Abre el proyecto desde un servidor local (ver README).',
      true
    );
  } finally {
    grilla.setAttribute('aria-busy', 'false');
  }
});
