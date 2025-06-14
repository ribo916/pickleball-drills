import { writable, derived } from 'svelte/store';
import type { Drill, DrillData } from '$lib/types/drills';

// Load drill data
async function loadDrills(): Promise<DrillData> {
  try {
    const response = await fetch('/drills.json');
    if (!response.ok) {
      throw new Error(`Failed to load drills: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error loading drills:', error);
    // Return a minimal valid structure to prevent crashes
    return {
      drills: [],
      categories: {},
      types: {}
    };
  }
}

// Create the store
function createDrillsStore() {
  const { subscribe, set, update } = writable<DrillData | null>(null);
  let currentDrillIndex = 0;
  let currentStepIndex = 0;

  return {
    subscribe,
    load: async () => {
      try {
        const data = await loadDrills();
        set(data);
      } catch (error) {
        console.error('Error in store load:', error);
        set({ drills: [], categories: {}, types: {} });
      }
    },
    getDrills: () => {
      let drills: Drill[] = [];
      subscribe(data => {
        if (data) {
          drills = data.drills;
        }
      })();
      return drills;
    },
    getCurrentDrillIndex: () => currentDrillIndex,
    setCurrentDrill: (index: number) => {
      update(data => {
        if (data && index >= 0 && index < data.drills.length) {
          currentDrillIndex = index;
          currentStepIndex = 0; // Reset step index when changing drills
        }
        return data;
      });
    },
    getCurrentDrill: () => {
      let currentDrill: Drill | null = null;
      subscribe(data => {
        if (data && data.drills.length > 0) {
          currentDrill = data.drills[currentDrillIndex] || null;
        }
      })();
      return currentDrill;
    },
    getCurrentStep: () => {
      let currentStep = null;
      subscribe(data => {
        if (data && data.drills.length > 0) {
          const drill = data.drills[currentDrillIndex];
          if (drill && drill.steps && drill.steps[currentStepIndex]) {
            currentStep = drill.steps[currentStepIndex];
          }
        }
      })();
      return currentStep;
    },
    nextStep: () => {
      update(data => {
        if (data && data.drills.length > 0) {
          const drill = data.drills[currentDrillIndex];
          if (drill && drill.steps && currentStepIndex < drill.steps.length - 1) {
            currentStepIndex++;
          }
        }
        return data;
      });
    },
    previousStep: () => {
      update(data => {
        if (data && currentStepIndex > 0) {
          currentStepIndex--;
        }
        return data;
      });
    },
    getCurrentStepIndex: () => currentStepIndex,
    getTotalSteps: () => {
      let total = 0;
      subscribe(data => {
        if (data && data.drills.length > 0) {
          const drill = data.drills[currentDrillIndex];
          total = drill?.steps?.length || 0;
        }
      })();
      return total;
    },
    // Drill selection methods
    getDrillsByType: (type: string) => {
      let drills: Drill[] = [];
      subscribe(data => {
        if (data) {
          drills = data.drills.filter(drill => drill.type === type);
        }
      })();
      return drills;
    },
    getDrillsByPlayerCount: (count: number) => {
      let drills: Drill[] = [];
      subscribe(data => {
        if (data) {
          drills = data.drills.filter(drill => drill.players === count);
        }
      })();
      return drills;
    },
    getDrillsByCategory: (category: string) => {
      let drills: Drill[] = [];
      subscribe(data => {
        if (data) {
          drills = data.drills.filter(drill => drill.category === category);
        }
      })();
      return drills;
    }
  };
}

export const drillsStore = createDrillsStore();

// Derived stores for filtering
export const drillsByCategory = derived(drillsStore, $drillsStore => {
  if (!$drillsStore || !$drillsStore.drills) return new Map();
  
  const drillsByCategory = new Map<string, Drill[]>();
  $drillsStore.drills.forEach(drill => {
    const categoryDrills = drillsByCategory.get(drill.category) || [];
    categoryDrills.push(drill);
    drillsByCategory.set(drill.category, categoryDrills);
  });
  
  return drillsByCategory;
});

export const drillsByType = derived(drillsStore, $drillsStore => {
  if (!$drillsStore || !$drillsStore.drills) return new Map();
  
  const drillsByType = new Map<string, Drill[]>();
  $drillsStore.drills.forEach(drill => {
    const typeDrills = drillsByType.get(drill.type) || [];
    typeDrills.push(drill);
    drillsByType.set(drill.type, typeDrills);
  });
  
  return drillsByType;
});

export const drillsByPlayerCount = derived(drillsStore, $drillsStore => {
  if (!$drillsStore || !$drillsStore.drills) return new Map();
  
  const drillsByPlayerCount = new Map<number, Drill[]>();
  $drillsStore.drills.forEach(drill => {
    const playerCountDrills = drillsByPlayerCount.get(drill.players) || [];
    playerCountDrills.push(drill);
    drillsByPlayerCount.set(drill.players, playerCountDrills);
  });
  
  return drillsByPlayerCount;
}); 