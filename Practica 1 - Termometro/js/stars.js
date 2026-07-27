function generateStars(count) {
    const shadows = Array.from({ length: count }, () =>
      `${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #fff`
    ).join(', ');
    return shadows;
  }

  ['stars', 'stars2', 'stars3'].forEach((id, i) => {
    const counts = [700, 200, 100];
    const el = document.getElementById(id);
    el.style.boxShadow = generateStars(counts[i]);
  });