import './style.css';
import { loadDrills } from './storage.js';
import { renderLibrary, setFilter } from './library.js';
import { showView } from './navigation.js';
import { openDrill } from './detail.js';
import {
  showCreator,
  updateCreatorCourt,
  renderCreatorCourt,
  toggleTag,
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
window.updateCreatorCourt = updateCreatorCourt;
window.renderCreatorCourt = renderCreatorCourt;
window.toggleTag = toggleTag;
window.addStepField = addStepField;
window.removeStep = removeStep;
window.saveDrill = saveDrill;
window.editCurrentDrill = editCurrentDrill;
window.deleteCurrentDrill = deleteCurrentDrill;

(async () => {
  await loadDrills();
  renderLibrary();
})();
