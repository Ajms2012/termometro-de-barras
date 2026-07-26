import {
  formatearHora,
  calcularAlturas,
  colorPorTemperatura,
  convertirTemperatura,
  formatearTemperatura,
} from "./utils.js";

const $estado = document.getElementById("estado");
const $resultado = document.getElementById("resultado");
const $titulo = document.getElementById("titulo-ciudad");
const $grafico = document.getElementById("grafico");
const $botonUnidad = document.getElementById("btn-unidad");
const $opcionesCiudad = document.getElementById("opciones-ciudad");

function animar(elementos, opciones) {
  if (!window.gsap) return;
  window.gsap.from(elementos, opciones);
}

function banderaEmoji(codigoPais) {
  if (!codigoPais || codigoPais.length !== 2) return "🌍";
  return [...codigoPais.toUpperCase()]
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join("");
}

function hueLatitud(lat) {
  return Math.round(25 + (Math.abs(lat) / 90) * 200);
}

function formatearCoordenadas(lat, lon) {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(1)}°${latDir} · ${Math.abs(lon).toFixed(1)}°${lonDir}`;
}

function animarBarrasExtremas(tipo) {
  const barras = $grafico.querySelectorAll(".barra__relleno");
  const propDur = tipo === "calor" ? "--fuego-dur" : "--hielo-dur";
  const durBase = tipo === "calor" ? 0.28 : 1.5;
  const durRango = tipo === "calor" ? 0.32 : 0.9;

  barras.forEach((barra) => {
    const dur = (durBase + Math.random() * durRango).toFixed(2);
    barra.style.setProperty(propDur, `${dur}s`);
  });
}

function ocultarOpciones() {
  $opcionesCiudad.hidden = true;
  $opcionesCiudad.innerHTML = "";
}

export function mostrarCargando(ciudad) {
  $estado.textContent = "";
  $estado.append(
    document.createTextNode(`Buscando el tiempo en ${ciudad}`),
    Object.assign(document.createElement("span"), { className: "estado__puntos", ariaHidden: "true" }),
  );
  $estado.classList.remove("estado--error");
  $resultado.hidden = true;
  ocultarOpciones();
  animar($estado, { opacity: 0, y: -6, duration: 0.25, ease: "power2.out" });
}

export function mostrarError(mensaje) {
  $estado.textContent = mensaje;
  $estado.classList.add("estado--error");
  $resultado.hidden = true;
  ocultarOpciones();
  animar($estado, { x: -8, duration: 0.08, repeat: 3, yoyo: true, ease: "power1.inOut" });
}

export function limpiarEstado() {
  $estado.textContent = "";
  $estado.classList.remove("estado--error");
}

export function pintarOpcionesCiudad(ciudades, alElegirCiudad) {
  limpiarEstado();
  $resultado.hidden = true;
  $opcionesCiudad.hidden = false;
  $opcionesCiudad.innerHTML = "";

  const titulo = document.createElement("h2");
  titulo.className = "opciones__titulo";
  titulo.textContent = "Elige una ciudad";

  const lista = document.createElement("div");
  lista.className = "opciones__lista";

  ciudades.forEach((ciudad) => {
    const boton = document.createElement("button");
    boton.className = "opciones__item";
    boton.type = "button";
    boton.dataset.id = String(ciudad.id);
    boton.style.setProperty("--ciudad-hue", hueLatitud(ciudad.lat));

    const cabecera = document.createElement("div");
    cabecera.className = "opciones__cabecera";
    cabecera.setAttribute("aria-hidden", "true");

    const bandera = document.createElement("span");
    bandera.className = "opciones__bandera";
    bandera.textContent = banderaEmoji(ciudad.codigoPais);

    const pulso = document.createElement("span");
    pulso.className = "opciones__pulso";

    cabecera.append(bandera, pulso);

    const cuerpo = document.createElement("div");
    cuerpo.className = "opciones__cuerpo";

    const nombre = document.createElement("span");
    nombre.className = "opciones__nombre";
    nombre.textContent = ciudad.nombre;

    const detalle = document.createElement("span");
    detalle.className = "opciones__detalle";
    detalle.textContent = [ciudad.region, ciudad.pais].filter(Boolean).join(", ");

    const coords = document.createElement("span");
    coords.className = "opciones__coords";
    coords.textContent = formatearCoordenadas(ciudad.lat, ciudad.lon);

    cuerpo.append(nombre, detalle, coords);
    boton.append(cabecera, cuerpo);
    boton.addEventListener("click", () => alElegirCiudad(ciudad));
    lista.append(boton);
  });

  $opcionesCiudad.append(titulo, lista);
  animar($opcionesCiudad, { opacity: 0, y: 12, duration: 0.3, ease: "power2.out" });
  animar($opcionesCiudad.querySelectorAll(".opciones__item"), {
    y: 10,
    duration: 0.28,
    stagger: 0.04,
    ease: "power2.out",
  });
}

export function pintarGrafico(ciudad, datosHorarios, unidad = "C") {
  const temperaturas = datosHorarios.map((d) => d.temperatura);
  const alturas = calcularAlturas(temperaturas);
  const valoresDisplay = datosHorarios.map((d) =>
    Math.round(convertirTemperatura(d.temperatura, unidad))
  );

  $titulo.textContent = [ciudad.nombre, ciudad.region, ciudad.pais].filter(Boolean).join(", ");
  $botonUnidad.textContent = unidad === "C" ? "°F" : "°C";
  $botonUnidad.setAttribute("aria-label", unidad === "C" ? "Cambiar a Fahrenheit" : "Cambiar a Celsius");
  $grafico.innerHTML = "";
  ocultarOpciones();

  const fragmento = document.createDocumentFragment();

  datosHorarios.forEach((dato, i) => {
    const barra = document.createElement("div");
    barra.className = "barra";
    barra.title = `${formatearHora(dato.hora)} - ${formatearTemperatura(dato.temperatura, unidad)}`;

    const valor = document.createElement("span");
    valor.className = "barra__valor";
    valor.textContent = window.gsap ? "0" : valoresDisplay[i];

    const relleno = document.createElement("div");
    relleno.className = "barra__relleno";
    relleno.style.setProperty("--altura", `${alturas[i]}%`);
    barra.style.setProperty("--color", colorPorTemperatura(dato.temperatura));

    if (dato.temperatura > 30) {
      barra.classList.add("barra--calor");
    } else if (dato.temperatura < 7) {
      barra.classList.add("barra--frio");
    }

    const hora = document.createElement("span");
    hora.className = "barra__hora";
    hora.textContent = formatearHora(dato.hora);

    if (window.gsap) {
      barra.addEventListener("mouseenter", () => {
        window.gsap.to(barra, { y: -5, duration: 0.22, ease: "power2.out", overwrite: true });
        window.gsap.to(valor, { scale: 1.22, duration: 0.22, ease: "back.out(2.5)", overwrite: true });
      });
      barra.addEventListener("mouseleave", () => {
        window.gsap.to(barra, { y: 0, duration: 0.28, ease: "elastic.out(1, 0.5)", overwrite: true });
        window.gsap.to(valor, { scale: 1, duration: 0.22, ease: "power2.out", overwrite: true });
      });
    }

    barra.append(valor, relleno, hora);
    fragmento.append(barra);
  });

  $grafico.append(fragmento);
  $resultado.hidden = false;

  if (window.gsap) {
    const gsap = window.gsap;

    gsap.from($resultado, { autoAlpha: 0, y: 14, duration: 0.38, ease: "power3.out" });
    gsap.from($titulo, { autoAlpha: 0, x: -14, duration: 0.42, ease: "power3.out", delay: 0.06 });
    gsap.from($botonUnidad, { autoAlpha: 0, scale: 0.6, duration: 0.35, ease: "back.out(2)", delay: 0.1 });

    gsap.from($grafico.querySelectorAll(".barra__relleno"), {
      scaleY: 0,
      transformOrigin: "bottom center",
      duration: 0.72,
      stagger: { each: 0.016, ease: "power2.inOut" },
      ease: "back.out(1.6)",
      delay: 0.12,
    });

    const valoresElem = [...$grafico.querySelectorAll(".barra__valor")];
    valoresElem.forEach((elem, i) => {
      const obj = { n: 0 };
      gsap.to(obj, {
        n: valoresDisplay[i],
        duration: 0.78,
        delay: 0.14 + i * 0.016,
        ease: "power2.out",
        onUpdate() { elem.textContent = Math.round(obj.n); },
      });
    });
  } else {
    animar($resultado, { opacity: 0, y: 14, duration: 0.35, ease: "power2.out" });
    animar($grafico.querySelectorAll(".barra__relleno"), {
      scaleY: 0,
      transformOrigin: "bottom center",
      duration: 0.5,
      stagger: 0.015,
      ease: "power3.out",
    });
  }

}
