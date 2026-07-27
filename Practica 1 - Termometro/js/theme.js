  const CLAVE = 'tema';
  const $checkbox = document.getElementById('input');
  const $sol = document.getElementById('sol');

  function aplicarTema(tema) {
    document.body.dataset.theme = tema;
    $sol.classList.toggle('hidden', tema === 'dark');
    $checkbox.checked = tema === 'dark'; // checked = modo oscuro
  }

  $checkbox.addEventListener('change', () => {
    const nuevo = $checkbox.checked ? 'dark' : 'light';
    localStorage.setItem(CLAVE, nuevo);
    aplicarTema(nuevo);
  });

  const guardado = localStorage.getItem(CLAVE) ?? 'dark';
  aplicarTema(guardado);