import { create } from 'zustand';

export const useTargetStore = create((set) => ({
  targets: [],
  detectedTargets: [],
  completedTargets: {}, // Initialize as empty object
  currentlyScanning: null,
  
  // Just mark a target as initially detected
  addDetectedTarget: (target) => set(state => ({
    detectedTargets: [...state.detectedTargets.filter(t => 
      t.id !== target.id && t.position.toString() !== target.position.toString()
    ), target]
  })),
  
  // Set the target that's currently being scanned
  setCurrentlyScanning: (target) => set({
    currentlyScanning: target
  }),
  
  // Update this method to ensure soldier targets are properly tracked
  markTargetComplete: (target) => {
    if (!target) return;
    
    set(state => {
      // Create a copy of the completed targets, ensure it's an object
      const completedTargets = {...(state.completedTargets || {})};
      
      // Ensure the target type exists in our tracking object
      if (!completedTargets[target.type]) {
        completedTargets[target.type] = 0;
      }
      
      // Increment the count for this target type
      completedTargets[target.type]++;
      
      console.log(`Target marked complete: ${target.type}. Total now: ${completedTargets[target.type]}`);
      
      // Add the target to detected targets if not already there
      const targetExists = state.detectedTargets.some(t => 
        t.type === target.type && 
        t.position.join(',') === target.position.join(',')
      );
      
      const detectedTargets = targetExists 
        ? [...state.detectedTargets] 
        : [...state.detectedTargets, {...target}];
      
      return {
        ...state,
        completedTargets,
        detectedTargets,
        currentlyScanning: null,
      };
    });
  },
  
  // Reset all targets (for new mission)
  resetTargets: () => set({
    targets: [],
    detectedTargets: [],
    completedTargets: {}, // Reset to empty object
    currentlyScanning: null,
  }),
}));