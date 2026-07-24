import { formatearHora, calcularAlturas, colorPorTemperatura } from "./utils.js";

const $estado = document.getElementById("estado");
const $resultado = document.getElementById("resultado");
const $titulo = document.getElementById("titulo-ciudad");
const $grafico = document.getElementById("grafico");

export function mostrarCargando(ciudad) {
  $estado.textContent = `Buscando el tiempo en ${ciudad}…`;
  $estado.classList.remove("estado--error");
  $resultado.hidden = true;
}

export function mostrarError(mensaje) {
  $estado.textContent = mensaje;
  $estado.classList.add("estado--error");
  $resultado.hidden = true;
}

export function limpiarEstado() {
  $estado.textContent = "";
  $estado.classList.remove("estado--error");
}

export function pintarGrafico(ciudad, datosHorarios) {
  const temperaturas = datosHorarios.map((d) => d.temperatura);
  const alturas = calcularAlturas(temperaturas);

  $titulo.textContent = `${ciudad.nombre}, ${ciudad.pais}`;
  $grafico.innerHTML = "";

  const fragmento = document.createDocumentFragment();

  datosHorarios.forEach((dato, i) => {
    const barra = document.createElement("div");
    barra.className = "barra";
    barra.title = `${formatearHora(dato.hora)} — ${dato.temperatura} °C`;

    const valor = document.createElement("span");
    valor.className = "barra__valor";
    valor.textContent = Math.round(dato.temperatura);

    const relleno = document.createElement("div");
    relleno.className = "barra__relleno";
    relleno.style.setProperty("--altura", `${alturas[i]}%`);
    relleno.style.setProperty("--color", colorPorTemperatura(dato.temperatura));

    const hora = document.createElement("span");
    hora.className = "barra__hora";
    hora.textContent = formatearHora(dato.hora);

    barra.append(valor, relleno, hora);
    fragmento.append(barra);
  });

  $grafico.append(fragmento);
  $resultado.hidden = false;
}