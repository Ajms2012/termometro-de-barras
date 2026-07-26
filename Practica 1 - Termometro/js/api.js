const URL_GEO = "https://geocoding-api.open-meteo.com/v1/search";
const URL_TIEMPO = "https://api.open-meteo.com/v1/forecast";

export async function buscarCiudades(nombre) {
  const url = `${URL_GEO}?name=${encodeURIComponent(nombre)}&count=6&language=es&format=json`;

  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`El servicio de búsqueda falló (${respuesta.status})`);
  }

  const datos = await respuesta.json();

  if (!datos.results || datos.results.length === 0) {
    throw new Error(`No he encontrado ninguna ciudad llamada "${nombre}"`);
  }

  return datos.results.map((ciudad) => ({
    id: ciudad.id,
    nombre: ciudad.name,
    pais: ciudad.country,
    codigoPais: ciudad.country_code ?? "",
    region: ciudad.admin1,
    lat: ciudad.latitude,
    lon: ciudad.longitude,
  }));
}

export async function buscarCiudad(nombre) {
  const ciudades = await buscarCiudades(nombre);
  return ciudades[0];
}

export async function obtenerTemperaturas(lat, lon) {
  const url = `${URL_TIEMPO}?latitude=${lat}&longitude=${lon}`
            + `&hourly=temperature_2m,weather_code,precipitation_probability&forecast_days=1&timezone=auto`;

  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`El servicio meteorológico falló (${respuesta.status})`);
  }

  const datos = await respuesta.json();

  return datos.hourly.time.map((instante, i) => ({
    hora: instante,
    temperatura: datos.hourly.temperature_2m[i],
    codigoClima: datos.hourly.weather_code[i],
    probabilidadLluvia: datos.hourly.precipitation_probability[i],
  }));
}
