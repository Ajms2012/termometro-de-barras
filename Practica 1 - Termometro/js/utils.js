export function formatearHora(instanteISO) {
    return instanteISO.slice(11, 16);
  }
  
  export function calcularAlturas(temperaturas) {
    const min = Math.min(...temperaturas);
    const max = Math.max(...temperaturas);
    const rango = max - min;
  
    return temperaturas.map((t) => {
      if (rango === 0) return 100;
      return 10 + ((t - min) / rango) * 90;
    });
  }
  
  export function colorPorTemperatura(t) {
    const T_MIN = -5;
    const T_MAX = 40;
  
    const proporcion = (t - T_MIN) / (T_MAX - T_MIN);
    const acotada = Math.min(1, Math.max(0, proporcion));
  
    const tono = 220 - acotada * 220;
  
    return `hsl(${tono}, 75%, 55%)`;
  }