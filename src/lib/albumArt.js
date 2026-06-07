/**
 * Generates an offline album-art placeholder as an SVG data URI. Hue comes from
 * valence (warmer = happier), brightness from energy. Lets the demo show art with
 * no network/CDN. Swap for real cover art when a licensed catalog lands.
 */
export function makeAlbumArt(track) {
  const hue = Math.round(((track.valence ?? 3) - 1) / 4 * 140 + 200) % 360; // 200..340-ish
  const light = 35 + (track.energy ?? 3) * 6;
  const c1 = `hsl(${hue}, 70%, ${light}%)`;
  const c2 = `hsl(${(hue + 40) % 360}, 65%, ${light + 12}%)`;
  const initials = track.title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="300" height="300" fill="url(#g)"/>
    <text x="50%" y="54%" font-family="Helvetica,Arial,sans-serif" font-size="120"
      font-weight="700" fill="rgba(255,255,255,0.85)" text-anchor="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
