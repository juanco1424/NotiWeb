const formulario = document.getElementById("formularioContacto");

// Nombre
const nombre = document.getElementById("nombre");
const errorNombre = document.getElementById("errorNombre");

// Teléfono
const telefono = document.getElementById("telefono");
const errorTelefono = document.getElementById("errorTelefono");

// Mensaje
const mensaje = document.getElementById("mensaje");
const errorMensaje = document.getElementById("errorMensaje");


formulario.addEventListener("submit", function(event) {


    event.preventDefault();

    let nombreValido = true;
    let telefonoValido = true;
    let mensajeValido = true;

    if (nombre.value.trim() === "") {

        errorNombre.textContent =
            "El nombre completo es obligatorio.";

        nombreValido = false;

    } else {

        errorNombre.textContent = "";
    }


    const telefonoRegex = /^[0-9]+$/;

    if (telefono.value.trim() === "") {

        errorTelefono.textContent =
            "El número de teléfono es obligatorio.";

        telefonoValido = false;

    } else if (!telefonoRegex.test(telefono.value.trim())) {

        errorTelefono.textContent =
            "El teléfono solo puede contener números.";

        telefonoValido = false;

    } else {

        errorTelefono.textContent = "";
    }


    if (mensaje.value.trim() === "") {

        errorMensaje.textContent =
            "El mensaje es obligatorio.";

        mensajeValido = false;

    } else {

        errorMensaje.textContent = "";
    }


    if (nombreValido && telefonoValido && mensajeValido) {

        const confirmacion =
            document.getElementById("confirmacion");

        confirmacion.textContent =
            "✓ Mensaje enviado correctamente. Gracias por contactarnos.";

        confirmacion.style.display = "block";

        // Limpia el formulario
        formulario.reset();
    }

});