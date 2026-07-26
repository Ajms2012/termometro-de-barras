import { buscarCiudades, obtenerTemperaturas } from "./api.js";
import { pintarGrafico, pintarOpcionesCiudad, mostrarCargando, mostrarError, limpiarEstado } from "./render.js";
import { aplicarClima, inicializarRive, inicializarTema } from "./motion.js";

const $input = document.getElementById("input-ciudad");
const $boton = document.getElementById("btn-buscar");
const $botonUnidad = document.getElementById("btn-unidad");
const $campoBusqueda = document.querySelector(".search__field");

let cargando = false;
let unidad = "C";
let ciudadActual = null;
let horasActuales = [];

const CLAVE_ULTIMA_CIUDAD = "termometro.ultimaCiudad";

inicializarTema();
inicializarRive();

if (window.gsap) {
  window.gsap.from(".app__intro > *", {
    autoAlpha: 0,
    y: 12,
    duration: 0.46,
    stagger: 0.07,
    ease: "power2.out",
  });
  window.gsap.to(".app__eyebrow-dot", {
    scale: 1.18,
    duration: 1.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
  window.gsap.to(".app__title", {
    textShadow: "0 0 18px rgba(244, 177, 93, 0.28)",
    duration: 1.6,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}

function textoCiudad(ciudad) {
  return [ciudad.nombre, ciudad.region, ciudad.pais].filter(Boolean).join(", ");
}

function guardarUltimaCiudad(ciudad) {
  localStorage.setItem(CLAVE_ULTIMA_CIUDAD, JSON.stringify(ciudad));
}

function leerUltimaCiudad() {
  const guardada = localStorage.getItem(CLAVE_ULTIMA_CIUDAD);
  if (!guardada) return null;

  try {
    return JSON.parse(guardada);
  } catch {
    localStorage.removeItem(CLAVE_ULTIMA_CIUDAD);
    return null;
  }
}

async function cargarCiudad(ciudad) {
  if (cargando) return;

    cargando = true;
    $boton.disabled = true;
    mostrarCargando(textoCiudad(ciudad));

  try {
    const horas = await obtenerTemperaturas(ciudad.lat, ciudad.lon);

    ciudadActual = ciudad;
    horasActuales = horas;
    $input.value = ciudad.nombre;
    guardarUltimaCiudad(ciudad);
    limpiarEstado();
    aplicarClima(ciudadActual, horasActuales);
    pintarGrafico(ciudadActual, horasActuales, unidad);
  } catch (error) {
    mostrarError(error.message);
    console.error(error);
  } finally {
    cargando = false;
    $boton.disabled = false;
  }
}

async function manejarBusqueda() {
  const consulta = $input.value.trim();

  if (consulta === "") {
    mostrarError("Escribe el nombre de una ciudad.");
    return;
  }

  if (cargando) return;

  cargando = true;
  $boton.disabled = true;
  mostrarCargando(consulta);

  try {
    const ciudades = await buscarCiudades(consulta);

    if (ciudades.length > 1) {
      pintarOpcionesCiudad(ciudades, cargarCiudad);
      return;
    }

    const ciudad = ciudades[0];
    mostrarCargando(textoCiudad(ciudad));
    const horas = await obtenerTemperaturas(ciudad.lat, ciudad.lon);

    ciudadActual = ciudad;
    horasActuales = horas;
    $input.value = ciudad.nombre;
    guardarUltimaCiudad(ciudad);
    limpiarEstado();
    aplicarClima(ciudadActual, horasActuales);
    pintarGrafico(ciudadActual, horasActuales, unidad);
  } catch (error) {
    mostrarError(error.message);
    console.error(error);
  } finally {
    cargando = false;
    $boton.disabled = false;
  }
}

$boton.addEventListener("click", manejarBusqueda);

$boton.addEventListener("pointerdown", () => {
  if (!window.gsap || $boton.disabled) return;

  window.gsap.fromTo(
    $boton,
    { scale: 0.97 },
    { scale: 1, duration: 0.24, ease: "back.out(2)" }
  );
});

$input.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") manejarBusqueda();
});

$input.addEventListener("focus", () => {
  if (!window.gsap || !$campoBusqueda) return;

  window.gsap.fromTo(
    $campoBusqueda,
    { y: 0 },
    { y: -2, duration: 0.22, ease: "power2.out" }
  );
});

$input.addEventListener("blur", () => {
  if (!window.gsap || !$campoBusqueda) return;

  window.gsap.to($campoBusqueda, { y: 0, duration: 0.2, ease: "power2.out" });
});

$input.addEventListener("input", () => {
  if (!window.gsap || !$campoBusqueda) return;

  window.gsap.fromTo(
    ".search__icon",
    { rotate: -8 },
    { rotate: 0, duration: 0.28, ease: "elastic.out(1, 0.45)" }
  );
});

$botonUnidad.addEventListener("click", () => {
  if (!ciudadActual || horasActuales.length === 0) return;

  if (window.gsap) {
    window.gsap.to($botonUnidad, {
      rotationY: 90,
      duration: 0.16,
      ease: "power2.in",
      onComplete() {
        unidad = unidad === "C" ? "F" : "C";
        pintarGrafico(ciudadActual, horasActuales, unidad);
        window.gsap.fromTo(
          $botonUnidad,
          { rotationY: -90 },
          { rotationY: 0, duration: 0.22, ease: "back.out(2)" }
        );
      },
    });
  } else {
    unidad = unidad === "C" ? "F" : "C";
    pintarGrafico(ciudadActual, horasActuales, unidad);
  }
});

const ciudadGuardada = leerUltimaCiudad();

if (ciudadGuardada) {
  $input.value = ciudadGuardada.nombre;
  cargarCiudad(ciudadGuardada);
} else {
  $input.value = "Málaga";
  manejarBusqueda();
}
