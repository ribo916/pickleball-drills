export function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

export function parseVideoUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const s = url.trim();

  // YouTube long form: youtube.com/watch?v=VIDEO_ID[&...]
  let m = s.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;

  // YouTube short form: youtu.be/VIDEO_ID
  m = s.match(/youtu\.be\/([\w-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;

  // YouTube already an embed URL: youtube.com/embed/VIDEO_ID
  m = s.match(/youtube\.com\/embed\/([\w-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;

  // Vimeo: vimeo.com/NUMERIC_ID
  m = s.match(/vimeo\.com\/(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;

  return null;
}
