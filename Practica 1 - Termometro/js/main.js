import { buscarCiudad, obtenerTemperaturas } from "./api.js";
import { pintarGrafico, mostrarCargando, mostrarError, limpiarEstado } from "./render.js";

const $input = document.getElementById("input-ciudad");
const $boton = document.getElementById("btn-buscar");

let cargando = false;

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
    const ciudad = await buscarCiudad(consulta);
    const horas = await obtenerTemperaturas(ciudad.lat, ciudad.lon);

    limpiarEstado();
    pintarGrafico(ciudad, horas);
  } catch (error) {
    mostrarError(error.message);
    console.error(error);
  } finally {
    cargando = false;
    $boton.disabled = false;
  }
}

$boton.addEventListener("click", manejarBusqueda);

$input.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") manejarBusqueda();
});

$input.value = "Málaga";
manejarBusqueda();