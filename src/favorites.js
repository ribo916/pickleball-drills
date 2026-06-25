import { state } from './state.js';
import { renderLibrary } from './library.js';

let favs = loadFavorites();

function loadFavorites() {
  try { return new Set(JSON.parse(localStorage.getItem('pickle-favorites') || '[]')); }
  catch { return new Set(); }
}

function saveFavorites() {
  localStorage.setItem('pickle-favorites', JSON.stringify([...favs]));
}

export function isFavorite(id) {
  return favs.has(id);
}

export function toggleFavorite(id) {
  if (favs.has(id)) favs.delete(id); else favs.add(id);
  saveFavorites();
  if (state.favoritesFilter) {
    renderLibrary();
  } else {
    document.querySelectorAll(`[data-favorite-id="${id}"]`).forEach(el => {
      el.classList.toggle('fav-btn--on', favs.has(id));
    });
  }
}
