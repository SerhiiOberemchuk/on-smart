export function getBlurDataUrl({
  width = 16,
  height = 9,
  background = "#0f172a",
  foreground = "#1e293b",
}: {
  width?: number;
  height?: number;
  background?: string;
  foreground?: string;
} = {}) {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='${background}' />
          <stop offset='100%' stop-color='${foreground}' />
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)' />
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
