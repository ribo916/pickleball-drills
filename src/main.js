import './style.css';
import { initTheme, setTheme, toggleThemePicker } from './theme.js';
import { loadDrills } from './storage.js';
import { renderLibrary, toggleLibraryTag, clearLibraryTags, setLibrarySearch, setLibrarySort, toggleFavoritesFilter, openQuickAdd, closeQuickAdd, saveQuickAdd } from './library.js';
import { toggleFavorite } from './favorites.js';
import { loadSession, showSession, addToSession, removeFromSession, clearSession, sessionMoveUp, sessionMoveDown, openSessionDrill } from './session.js';
import { showView } from './navigation.js';
import { openDrill, stepNav, duplicateCurrentDrill } from './detail.js';
import { showRandomizer, pickRandomDrill, openPickedDrill } from './randomizer.js';
import {
  showCreator,
  openCourtModal,
  closeCourtModal,
  setPlayerPosition,
  selectActivePlayer,
  selectPlayerCount,
  toggleTag,
  addCustomTag,
  addStepField,
  removeStep,
  saveDrill,
  editCurrentDrill,
  deleteCurrentDrill,
} from './creator.js';

// Expose to window so inline onclick attributes in index.html resolve correctly
window.showView = showView;
window.showCreator = showCreator;
window.openDrill = openDrill;
window.toggleLibraryTag = toggleLibraryTag;
window.clearLibraryTags = clearLibraryTags;
window.setLibrarySort = setLibrarySort;
window.setLibrarySearch = setLibrarySearch;
window.openQuickAdd = openQuickAdd;
window.closeQuickAdd = closeQuickAdd;
window.saveQuickAdd = saveQuickAdd;
window.openCourtModal = openCourtModal;
window.closeCourtModal = closeCourtModal;
window.setPlayerPosition = setPlayerPosition;
window.selectActivePlayer = selectActivePlayer;
window.stepNav = stepNav;
window.duplicateCurrentDrill = duplicateCurrentDrill;
window.toggleFavorite = toggleFavorite;
window.toggleFavoritesFilter = toggleFavoritesFilter;
window.selectPlayerCount = selectPlayerCount;
window.toggleTag = toggleTag;
window.addCustomTag = addCustomTag;
window.addStepField = addStepField;
window.removeStep = removeStep;
window.saveDrill = saveDrill;
window.editCurrentDrill = editCurrentDrill;
window.deleteCurrentDrill = deleteCurrentDrill;
window.showRandomizer  = showRandomizer;
window.pickRandomDrill = pickRandomDrill;
window.openPickedDrill = openPickedDrill;
window.setTheme = setTheme;
window.toggleThemePicker = toggleThemePicker;
window.showSession = showSession;
window.addToSession = addToSession;
window.removeFromSession = removeFromSession;
window.clearSession = clearSession;
window.sessionMoveUp = sessionMoveUp;
window.sessionMoveDown = sessionMoveDown;
window.openSessionDrill = openSessionDrill;

(async () => {
  initTheme();
  loadSession();
  await loadDrills();
  renderLibrary();
})();
