import { renderLibrary } from './library.js';
import { renderSession } from './session.js';

export function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  if (name === 'library') renderLibrary();
  if (name === 'session') renderSession();
  window.scrollTo(0, 0);
}
