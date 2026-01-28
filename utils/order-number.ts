function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function makeOrderNumber(prefix = "OS") {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());

  // 4 символи base36, щоб навіть 2 замовлення в одну секунду не злиплися
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `${prefix}-${y}${m}${day}-${hh}${mm}${ss}-${rnd}`;
}

