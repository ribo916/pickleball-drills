import { renderLibrary } from './library.js';

export function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  if (name === 'library') renderLibrary();
  window.scrollTo(0, 0);
}
