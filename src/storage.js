import { state } from './state.js';
import { DEFAULT_DRILLS } from './defaultDrills.js';

const storage = {
  async get(key) {
    if (window.storage && window.storage.get) {
      const result = await window.storage.get(key, true);
      return result ? result.value : null;
    }
    try {
      const res = await fetch(`/api/${key}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      return JSON.stringify(data[key]);
    } catch (e) {
      return localStorage.getItem(key);
    }
  },
  async set(key, value) {
    if (window.storage && window.storage.set) {
      await window.storage.set(key, value, true);
      return;
    }
    try {
      await fetch(`/api/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: JSON.parse(value) }),
      });
    } catch (e) {
      localStorage.setItem(key, value);
    }
  },
};

export async function loadDrills() {
  try {
    const raw = await storage.get('drills');
    if (!raw) throw new Error('empty');
    const stored = JSON.parse(raw);
    // Stale check: wipes and reseeds if any drill is missing required fields
    const isStale = !Array.isArray(stored) || stored.length === 0 ||
      stored.some(d => d.startPositions === undefined);
    if (isStale) throw new Error('stale');
    state.drills = stored;
  } catch (e) {
    state.drills = JSON.parse(JSON.stringify(DEFAULT_DRILLS));
    await saveDrills();
  }
}

export async function saveDrills() {
  try {
    await storage.set('drills', JSON.stringify(state.drills));
  } catch (e) {
    console.error('Storage write failed:', e);
  }
}
