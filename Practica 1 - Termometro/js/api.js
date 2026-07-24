const URL_GEO = "https://geocoding-api.open-meteo.com/v1/search";
const URL_TIEMPO = "https://api.open-meteo.com/v1/forecast";

export async function buscarCiudad(nombre) {
  const url = `${URL_GEO}?name=${encodeURIComponent(nombre)}&count=1&language=es&format=json`;

  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`El servicio de búsqueda falló (${respuesta.status})`);
  }

  const datos = await respuesta.json();

  if (!datos.results || datos.results.length === 0) {
    throw new Error(`No he encontrado ninguna ciudad llamada "${nombre}"`);
  }

  const ciudad = datos.results[0];

  return {
    nombre: ciudad.name,
    pais: ciudad.country,
    lat: ciudad.latitude,
    lon: ciudad.longitude,
  };
}

export async function obtenerTemperaturas(lat, lon) {
  const url = `${URL_TIEMPO}?latitude=${lat}&longitude=${lon}`
            + `&hourly=temperature_2m&forecast_days=1&timezone=auto`;

  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`El servicio meteorológico falló (${respuesta.status})`);
  }

  const datos = await respuesta.json();

  return datos.hourly.time.map((instante, i) => ({
    hora: instante,
    temperatura: datos.hourly.temperature_2m[i],
  }));
}