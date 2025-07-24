import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUAVStore } from '../store/uavStore';
import { useMissionStore } from '../store/missionStore';
import { useClickControlStore } from '../store/clickControlStore';
import { useAttackDroneStore } from '../store/attackDroneStore';
import { useHoverState } from '../hooks/useHoverState';
import { useTargetStore } from '../store/targetStore';

const UAVController = () => {
  const hoverState = useRef({
    isHovering: false,
    targetPosition: null,
    hoverStartTime: null,
    hoverRadius: 8,
    hoverHeight: 15, // Default hover height
    currentAngle: 0,
    hoverSpeed: 0.5,
    hoverTimeAccumulated: 0, // Track hover time per target
    requiredHoverTime: 10,    // Seconds required to hover for each target
    returningToBase: false,   // Flag for return-to-base state
    baseReached: false        // Flag for when base is reached
  });
  
  const completedTargets = useRef(new Set()); // Track targets we've already surveilled
  
  // Add this variable at the top of the component with other refs
  const cooldownTimer = useRef(null);
  const isInCooldown = useRef(false);
  const lastUpdateTime = useRef(0);
  const UPDATE_INTERVAL = 16; // milliseconds (approx 60fps)

  // Initialize hover parameters based on target type
  const updateHoverParameters = (target) => {
    if (!target) return;
    
    // Set standard hover height of 15 units for all targets
    let height = 15;  // We want exactly 15 units above all targets
    let radius = 8;
    let speed = 0.5;
    let requiredTime = 5; // Reduced hover time
    
    // Slight customization per target type but keeping height consistent
    switch(target.type) {
      case 'tank':
        radius = 10;
        speed = 0.5;
        requiredTime = 5;
        break;
      case 'jeep':
        radius = 8;
        speed = 0.6;
        requiredTime = 4;
        break;
      case 'warehouse':
        radius = 12;
        speed = 0.4;
        requiredTime = 6;
        break;
      case 'soldier':
        height = 10; // Lower height for better soldier detection
        radius = 6;  // Smaller radius for tighter hover pattern
        speed = 0.7;
        requiredTime = 3; // Faster to complete
        break;
      default:
        radius = 8;
        speed = 0.5;
        requiredTime = 5;
    }
    
    // Safety check - ensure all values are valid numbers
    hoverState.current.hoverHeight = target.type === 'soldier' ? 10 : 15; // Lower height for soldiers
    hoverState.current.hoverRadius = isFinite(radius) ? radius : 8;
    hoverState.current.hoverSpeed = isFinite(speed) ? speed : 0.5;
    hoverState.current.requiredHoverTime = isFinite(requiredTime) ? requiredTime : 5;
    hoverState.current.hoverTimeAccumulated = 0; // Reset accumulated time for new target
    
    console.log(`Hover parameters set for ${target.type}: height=${hoverState.current.hoverHeight}, radius=${hoverState.current.hoverRadius}, requiredTime=${hoverState.current.requiredHoverTime}s`);
  };
  
  // Define movement handler BEFORE useFrame to avoid temporal dead zone
  const handleMovementToTarget = useCallback((posOrDelta, targetPos, setPosFunc, deltaValue) => {
    try {
      // Throttle position updates to prevent excessive state changes
      const now = Date.now();
      if (now - lastUpdateTime.current < UPDATE_INTERVAL) {
        return; // Skip this update if it's too soon
      }
      lastUpdateTime.current = now;
      
      let position, targetPosition, setPosition, setTargetPosition, delta;
      
      // Handle both calling conventions:
      // 1. Called with (position, targetPosition, setPosition, delta)
      // 2. Called with just (delta)
      if (Array.isArray(posOrDelta) && Array.isArray(targetPos) && typeof setPosFunc === 'function') {
        // Full parameters passed
        position = posOrDelta;
        targetPosition = targetPos;
        setPosition = setPosFunc;
        setTargetPosition = useUAVStore.getState().setTargetPosition;
        delta = deltaValue;
      } else {
        // Only delta passed
        delta = posOrDelta;
        const store = useUAVStore.getState();
        position = store.position;
        targetPosition = store.targetPosition;
        setPosition = store.setPosition;
        setTargetPosition = store.setTargetPosition;
      }
      
      // Validate all required values to prevent NaN
      if (!delta || !isFinite(delta)) delta = 1/60;
      if (!position || !targetPosition || !Array.isArray(position) || !Array.isArray(targetPosition)) {
        return;
      }
      
      // Optimized proximity check - larger threshold for smoother arrival
      if (Math.abs(position[0] - targetPosition[0]) < 2.0 && 
          Math.abs(position[1] - targetPosition[1]) < 2.0 && 
          Math.abs(position[2] - targetPosition[2]) < 2.0) {
        // Snap to target and clear it for immediate arrival
        setPosition(targetPosition);
        setTargetPosition(null);
        return;
      }

      // Calculate direction vector
      const direction = [
        targetPosition[0] - position[0],
        targetPosition[1] - position[1],
        targetPosition[2] - position[2]
      ];
      
      // Calculate distance with safeguards
      const distance = Math.sqrt(
        direction[0] * direction[0] + 
        direction[1] * direction[1] + 
        direction[2] * direction[2]
      );
      
      // Optimized distance check for immediate arrival
      if (distance < 3.0) {
        setPosition(targetPosition);
        setTargetPosition(null);
        return;
      }
      
      // Normalize direction with safety checks
      const normalizedDir = [
        distance > 0 ? direction[0] / distance : 0,
        distance > 0 ? direction[1] / distance : 0,
        distance > 0 ? direction[2] / distance : 0
      ];
      
      // OPTIMIZED UAV SPEED - much faster and smoother movement
      const speed = 80.0; // Increased from 20.0 to 80.0 for much faster movement
      const moveDistance = speed * delta;
      
      // Calculate new position with validation
      const newPosition = [
        position[0] + normalizedDir[0] * moveDistance,
        position[1] + normalizedDir[1] * moveDistance,
        position[2] + normalizedDir[2] * moveDistance
      ];
      
      // Final validation before setting position
      if (newPosition.some(val => !isFinite(val))) {
        console.error("Invalid position calculated:", newPosition);
        return;
      }
      
      // Important: Check if we'd overshoot
      const newDirection = [
        targetPosition[0] - newPosition[0],
        targetPosition[1] - newPosition[1],
        targetPosition[2] - newPosition[2]
      ];
      
      // Check if direction changed (we passed the target)
      const dotProduct = 
        direction[0] * newDirection[0] + 
        direction[1] * newDirection[1] + 
        direction[2] * newDirection[2];
      
      // Direct state updates for immediate response - no animation frame delay
      if (dotProduct < 0) {
        setPosition(targetPosition);
        setTargetPosition(null);
      } else {
        setPosition(newPosition);
      }
    } catch (error) {
      console.error("Error in movement calculations:", error);
    }
  }, []); // Empty dependency array
  
  useFrame((state, delta) => {
    // REMOVED the faulty block that was here.
    // The controller will now run for both drone types.

    // Optimized delta check - less restrictive for better performance
    if (!isFinite(delta) || delta <= 0) delta = 0.016; // 60fps baseline
    
    // Get all the state we need in a single call
    // FIX: Added 'droneType' to the destructuring assignment.
    const { position, targetPosition, setPosition, setTargetPosition, targets, isCrashed, droneType } = useUAVStore.getState();
    const { 
      isHovering, setIsHovering, currentTarget, setCurrentTarget, 
      objectives, updateHoverTime, missionTimeRemaining,
      missionStatus, updateMissionTime, completeMission 
    } = useMissionStore.getState();
    const { 
      missionState: attackMissionState, 
      attackPosition, 
      homeBase, 
      setManualTargetPosition,
      updateTargetLock,
      updateMissiles,
      positionReached
    } = useAttackDroneStore.getState();
    
    const { clickIndicator } = useClickControlStore.getState();
    
    // Don't update if crashed
    if (isCrashed || attackMissionState === 'crashed') return;

    // CRITICAL: Update attack drone systems for attack mode
    if (droneType === 'attack') {
      // Update target locking system (essential for fire missile button to work)
      updateTargetLock(delta);
      
      // Update missiles in flight
      updateMissiles(delta);
    }

    // If in attack mode, use the attack drone's target position
    if (droneType === 'attack' && (attackMissionState === 'moving' || attackMissionState === 'returning')) {
      const missionTarget = attackMissionState === 'moving' ? attackPosition : homeBase;
      if (missionTarget) {
        handleMovementToTarget(position, missionTarget, setPosition, delta);

        // Check if destination is reached
        const uavPos = new THREE.Vector3(...position);
        const targetPos = new THREE.Vector3(...missionTarget);
        if (uavPos.distanceTo(targetPos) < 2) {
          if (attackMissionState === 'moving') {
            // Call the proper positionReached function from attack drone store
            positionReached();
            console.log('Attack position reached - ready to engage targets');
          } else if (attackMissionState === 'returning') {
            useAttackDroneStore.setState({ missionState: 'idle' });
            console.log('Returned to base - mission complete');
          }
        }
      }
      return; // Skip surveillance logic for attack drone missions
    }
    
    // Update mission timer if mission is active
    if (missionStatus === 'active') {
      updateMissionTime(delta);
      
      // Return to base if less than 5 seconds remaining
      if (missionTimeRemaining <= 5 && !hoverState.current.returningToBase) {
        console.log("Less than 5 seconds remaining! Returning to base immediately...");
        hoverState.current.returningToBase = true;
        
        // Exit hover mode if currently hovering
        if (isHovering) {
          if (typeof setIsHovering === 'function') {
            setIsHovering(false);
          }
          setCurrentTarget(null);
          hoverState.current.isHovering = false;
          hoverState.current.targetPosition = null;
        }
        
        // Set target position to base
        const baseLocation = [-45, 30, -45]; // Default base location
        setTargetPosition(baseLocation);
        return; // Exit early to prevent other hover logic from running
      }
      
      // Check if we've reached the base after returning
      if (hoverState.current.returningToBase && position) {
        const uavPos = new THREE.Vector3(...position);
        const basePos = new THREE.Vector3(-45, 30, -45); // Base position
        const distanceToBase = uavPos.distanceTo(basePos);
        
        // If we're close to base, check if all targets were found before marking mission as complete
        if (distanceToBase < 5 && !hoverState.current.baseReached) {
          console.log("Base reached! Checking mission objectives...");
          hoverState.current.baseReached = true;
          
          // Get completed targets from targetStore
          const { completedTargets } = useTargetStore.getState();
          
          // Check if all required targets were detected
          const requiredTargets = ['tank', 'jeep', 'warehouse', 'soldier'];
          const allTargetsDetected = requiredTargets.every(target => 
            completedTargets[target] && completedTargets[target] > 0
          );
          
          if (allTargetsDetected) {
            console.log("All targets detected! Mission successful!");
            // Mark mission as complete
            setTimeout(() => {
              completeMission('completed');
            }, 1000);
          } else {
            console.log("Not all targets were detected! Mission failed!");
            // Mark mission as failed despite reaching base
            setTimeout(() => {
              completeMission('failed');
            }, 1000);
          }
        }
      }
    }
    
    // Safety checks - ensure position is valid
    if (!position || position.some(val => !isFinite(val))) {
      console.warn("Invalid UAV position detected:", position);
      return;
    }
    
    // Skip hover detection if returning to base
    if (hoverState.current.returningToBase) {
      // Only handle movement back to base
      handleMovementToTarget(position, targetPosition, setPosition, delta);
      return;
    }
    
    // MODIFIED LOGIC: Only start hovering for surveillance drones
    if (droneType === 'surveillance') {
      // Check if there's a new click indicator and it's on a target
      if (clickIndicator && clickIndicator.position && Array.isArray(clickIndicator.position) && !isHovering && !isInCooldown.current) {
        const clickPos = clickIndicator.position;
        
        // Find if the click is on/near a target
        const clickedTarget = findTargetAtPosition(targets, clickPos);
        
        if (clickedTarget) {
          console.log(`Starting hover above clicked target: ${clickedTarget.type}`);
          setCurrentTarget(clickedTarget);
          
          // Mark this target as currently being scanned in target store
          const { setCurrentlyScanning } = useTargetStore.getState();
          setCurrentlyScanning(clickedTarget);
          
          // Update mission store hover state
          if (typeof setIsHovering === 'function') {
            setIsHovering(true);
          }
          
          // Initialize hover parameters
          hoverState.current.isHovering = true;
          hoverState.current.targetPosition = [...clickedTarget.position];
          hoverState.current.hoverStartTime = Date.now();
          hoverState.current.currentAngle = Math.random() * Math.PI * 2; // Random start angle
          hoverState.current.hoverTimeAccumulated = 0; // Reset accumulated time
          
          // Update hover parameters based on target type
          updateHoverParameters(clickedTarget);
        }
      }
      
      // ADDITIONAL CHECK: Detect if UAV is positioned directly above a target
      // This allows hovering to start when UAV's altitude is manually lowered above a target
      if (!isHovering && !hoverState.current.isHovering && position && Array.isArray(targets) && !isInCooldown.current) {
        const uavPos = new THREE.Vector3(...position);
        
        // Find any target that is directly below the UAV
        for (const target of targets) {
          if (!target || !Array.isArray(target.position)) continue;
          
          // Skip targets we've already surveilled
          const targetKey = `${target.type}-${target.position.join(',')}`;
          if (completedTargets.current.has(targetKey)) continue;
          
          const targetPos = new THREE.Vector3(...target.position);
          
          // Calculate horizontal distance (ignoring Y axis)
          const horizontalDist = Math.sqrt(
            Math.pow(targetPos.x - uavPos.x, 2) + 
            Math.pow(targetPos.z - uavPos.z, 2)
          );
          
          // Calculate vertical distance (Y axis only)
          const verticalDist = uavPos.y - targetPos.y;
          
          // Check if UAV is directly above the target with appropriate altitude
          // Allow hovering from any altitude above the target, not just at exactly 15 units
          if (horizontalDist < (target.type === 'soldier' ? 12 : 8) && verticalDist > (target.type === 'soldier' ? 2 : 5) && verticalDist < 30) {
            console.log(`UAV positioned above target: ${target.type} at altitude ${verticalDist.toFixed(1)}`);
            
            // Set target position to this target's position with proper hover height
            const idealHoverY = targetPos.y + 15; // Ideal hover height
            
            // If we're already close to ideal height, start hovering immediately
            if (Math.abs(uavPos.y - idealHoverY) < 5) {
              console.log(`Starting hover above target: ${target.type} (manual positioning)`);
              setCurrentTarget(target);
              
              // Mark this target as currently being scanned
              const { setCurrentlyScanning } = useTargetStore.getState();
              setCurrentlyScanning(target);
              
              // Update mission store hover state
              if (typeof setIsHovering === 'function') {
                setIsHovering(true);
              }
              
              // Initialize hover parameters
              hoverState.current.isHovering = true;
              hoverState.current.targetPosition = [...target.position];
              hoverState.current.hoverStartTime = Date.now();
              hoverState.current.currentAngle = Math.random() * Math.PI * 2; // Random start angle
              hoverState.current.hoverTimeAccumulated = 0; // Reset accumulated time
              
              // Update hover parameters based on target type
              updateHoverParameters(target);
              
              // Exit the loop once we found a target to hover over
              break;
            } 
            // If we're not at ideal height, help guide the UAV to the right altitude
            else if (!targetPosition) {
              // Set target position to get to ideal hover height
              setTargetPosition([uavPos.x, idealHoverY, uavPos.z]);
              console.log(`Adjusting altitude to ideal hover height: ${idealHoverY.toFixed(1)}`);
            }
          }
        }
      }
    }
    
    // If we're hovering, continue the hover pattern
    if (isHovering && hoverState.current.isHovering && hoverState.current.targetPosition) {
      // Update hover time in mission store
      if (objectives && typeof updateHoverTime === 'function') {
        updateHoverTime(delta);
      }
      
      // Update our local hover time accumulator
      hoverState.current.hoverTimeAccumulated += delta;
      
      // Update shared hover state for UI access
      useHoverState.getState().updateHoverState({
        isHovering: true,
        targetType: currentTarget?.type || null,
        hoverTimeAccumulated: hoverState.current.hoverTimeAccumulated,
        requiredHoverTime: hoverState.current.requiredHoverTime,
        hoverProgress: hoverState.current.hoverTimeAccumulated / hoverState.current.requiredHoverTime
      });
      
      // Check if we've hovered long enough for this specific target
      const hoverComplete = hoverState.current.hoverTimeAccumulated >= hoverState.current.requiredHoverTime;
      
      // Exit hover mode if we've completed this target
      if (hoverComplete) {
        console.log(`Hover complete for ${currentTarget?.type}! Time spent: ${hoverState.current.hoverTimeAccumulated.toFixed(1)}s`);
        
        // Mark the target as completed
        const { markTargetComplete } = useTargetStore.getState();
        if (currentTarget) {
          markTargetComplete(currentTarget);
          
          // Add to our completed set to prevent re-detecting
          const targetKey = `${currentTarget.type}-${currentTarget.position.join(',')}`;
          completedTargets.current.add(targetKey);
          
          // SMOOTHER TRANSITION: Instead of sudden movement, maintain current position
          // and just increase altitude slightly
          const currentAltitude = position[1];
          const movePos = [
            position[0],
            currentAltitude + 5, // Just move up a bit from current position
            position[2]
          ];
          
          setTargetPosition(movePos);
        }
        
        // Exit hover mode
        if (typeof setIsHovering === 'function') {
          setIsHovering(false);
        }
        setCurrentTarget(null);
        
        // Reset hover state
        hoverState.current.isHovering = false;
        hoverState.current.targetPosition = null;
        hoverState.current.hoverTimeAccumulated = 0;
        
        // Reset shared hover state
        useHoverState.getState().resetHoverState();
        
        // Clear any click indicator
        useClickControlStore.getState().setClickIndicator(null);
        
        // Set cooldown to prevent immediate detection of another target
        isInCooldown.current = true;
        if (cooldownTimer.current) {
          clearTimeout(cooldownTimer.current);
        }
        cooldownTimer.current = setTimeout(() => {
          isInCooldown.current = false;
          console.log("Cooldown period ended. Ready for new target detection.");
        }, 2000); // 2 second cooldown
        
        return;
      }
      
      try {
        // Calculate hover position
        const targetPos = new THREE.Vector3(...hoverState.current.targetPosition);
        const radius = hoverState.current.hoverRadius;
        const height = hoverState.current.hoverHeight;
        
        // Update angle for circular motion
        hoverState.current.currentAngle += hoverState.current.hoverSpeed * delta;
        
        // Calculate new position on the circle
        const angleVal = hoverState.current.currentAngle;
        const cosVal = Math.cos(angleVal);
        const sinVal = Math.sin(angleVal);
        
        const hoverX = targetPos.x + (cosVal * radius);
        const hoverY = targetPos.y + height; // Maintain exactly 15 units above target
        const hoverZ = targetPos.z + (sinVal * radius);
        
        // FIXED: Only update position if it has changed significantly to prevent infinite loops
        const currentPos = position || [0, 0, 0];
        const newPos = [hoverX, hoverY, hoverZ];
        const positionChanged = Math.abs(currentPos[0] - newPos[0]) > 0.1 || 
                               Math.abs(currentPos[1] - newPos[1]) > 0.1 || 
                               Math.abs(currentPos[2] - newPos[2]) > 0.1;
        
        if (positionChanged) {
          setPosition(newPos);
        }
      } catch (err) {
        console.error("Error in hover calculations:", err);
      }
    } else if (!isHovering) {
      // Reset shared hover state if not hovering
      useHoverState.getState().resetHoverState();
      
      // Standard movement logic when not hovering
      handleMovementToTarget(position, targetPosition, setPosition, delta);
    }
  });

  // Helper function to find if a click position is near a target
  const findTargetAtPosition = (targets, clickPosition) => {
    if (!targets || !Array.isArray(targets) || !clickPosition) return null;
    
    // Convert click position to THREE.Vector3
    const clickPos = new THREE.Vector3(...clickPosition);
    
    // Find any target that is close to the click position
    let closestTarget = null;
    let closestDistance = Infinity;
    
    for (const target of targets) {
      if (!target || !Array.isArray(target.position)) continue;
      
      // Check if we've already completed this target
      const targetKey = `${target.type}-${target.position.join(',')}`;
      if (completedTargets.current.has(targetKey)) continue;
      
      const targetPos = new THREE.Vector3(...target.position);
      const distance = clickPos.distanceTo(targetPos);
      
      // Use different thresholds based on target type
      const threshold = target.type === 'soldier' ? 15 : 10; // Wider detection radius for soldiers
      
      if (distance < threshold && (distance < closestDistance || target.type === 'soldier')) {
        // If it's a soldier, prioritize it, otherwise take the closest
        if (target.type === 'soldier' || !closestTarget || closestTarget.type !== 'soldier') {
          closestTarget = target;
          closestDistance = distance;
        }
      }
    }
    
    return closestTarget;
  };

  // Add this to require manual movement to targets in attack mode:
  const handleTargetClick = useCallback((clickPosition) => {
    // Get current droneType
    const { droneType } = useUAVStore.getState();
    
    // For attack drones, only move when explicitly commanded
    if (droneType === 'attack') {
      // Set target position but don't automatically move
      useUAVStore.getState().setTargetPosition(clickPosition);
      useClickControlStore.getState().setClickPosition(clickPosition);
      return;
    }
    
    // Existing surveillance drone logic...
  }, []);

  // Clean up hover state when component unmounts
  useEffect(() => {
    return () => {
      hoverState.current = {
        isHovering: false,
        targetPosition: null,
        hoverStartTime: null,
        currentAngle: 0,
        hoverHeight: 15,
        hoverRadius: 8,
        hoverSpeed: 0.5,
        hoverTimeAccumulated: 0,
        requiredHoverTime: 5,
        returningToBase: false,
        baseReached: false
      };
      
      // Clear completed targets
      completedTargets.current.clear();
      
      // Reset shared hover state
      if (useHoverState && useHoverState.getState) {
        useHoverState.getState().resetHoverState();
      }
      
      // Clear any cooldown timer
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current);
        cooldownTimer.current = null;
      }
      isInCooldown.current = false;
    };
  }, []);

  return null;
};

export default UAVController;