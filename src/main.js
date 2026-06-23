import './style.css';
import { initTheme, setTheme, toggleThemePicker } from './theme.js';
import { loadDrills } from './storage.js';
import { renderLibrary, setFilter } from './library.js';
import { showView } from './navigation.js';
import { openDrill, stepNav } from './detail.js';
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
window.setFilter = setFilter;
window.openCourtModal = openCourtModal;
window.closeCourtModal = closeCourtModal;
window.setPlayerPosition = setPlayerPosition;
window.selectActivePlayer = selectActivePlayer;
window.stepNav = stepNav;
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

(async () => {
  initTheme();
  await loadDrills();
  renderLibrary();
})();
