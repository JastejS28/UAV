// import React, { useRef, useEffect } from 'react';
// import { useFrame } from '@react-three/fiber';
// import { useGLTF } from '@react-three/drei';
// import { useUAVStore } from '../../store/uavStore';
// import { useAttackDroneStore } from '../../store/attackDroneStore';
// import MissileSystem from './MissileSystem';
// import TargetLockSystem from './TargetLockSystem';
// import MissileLaunch from './WeaponryEffects/MissileLaunch';
// import UavDamageSystem from '../anti-drone/UavDamageSystem';
// import CrashedUAV from './CrashedUAV'; // Import the new component

// const AttackUAV = () => {
//   // Update the component to always start at the base position:
//   const basePosition = [-45, 35, -40];
//   const { position, rotation, speed, isCrashed, droneType } = useUAVStore();
  
//   // Use surveillance drone model but with smaller scale until you have attack drone model
//   const { scene } = useGLTF('/models/surveillance-uav/drone.glb');
  
//   const uavRef = useRef();
//   const { 
//     activeMissiles, 
//     updateMissiles, 
//     initTargets, 
//     updateMissionMovement,
//     missionState,
//     droneHealth,
//     updateCrashAnimation // Add this new import
//   } = useAttackDroneStore();
  
//   // Initialize the targets and spawn attack UAV at base position when attack mode is first activated
//   useEffect(() => {
//     console.log("AttackUAV mounted - initializing targets and position");
//     initTargets();
    
//     // FIXED: Spawn attack UAV at base position when component mounts
//     // Since AttackUAV component only renders in attack mode, we can spawn at base
//     const currentPos = useUAVStore.getState().position;
    
//     // Check if UAV is at default position (0, 50, 0) - indicating fresh spawn
//     const isAtDefaultPosition = 
//       Math.abs(currentPos[0]) < 0.1 && 
//       Math.abs(currentPos[1] - 50) < 0.1 && 
//       Math.abs(currentPos[2]) < 0.1;
    
//     if (isAtDefaultPosition) {
//       console.log("Spawning attack UAV at base position:", basePosition);
//       useUAVStore.getState().setPosition(basePosition);
//     }
//   }, [initTargets]);
  
//   useFrame((state, delta) => {
//     // If in crashed state, update crash animation but don't position the main UAV model
//     if (missionState === 'crashed') {
//       // Update falling animation
//       updateCrashAnimation(delta);
//       return;
//     }
    
//     if (!uavRef.current) return;
    
//     // Update UAV position based on store
//     if (position && position.length === 3) {
//       uavRef.current.position.set(...position);
//     }
    
//     // Update UAV rotation based on store
//     if (rotation && rotation.length === 3) {
//       uavRef.current.rotation.set(...rotation);
//     }
    
//     // Update attack mission movement
//     updateMissionMovement(delta);
    
//     // Update missiles in flight
//     updateMissiles(delta);
//   });
  
//   // If the drone is crashed, show the crashed version
//   if (missionState === 'crashed') {
//     return <CrashedUAV position={position} />;
//   }
  
//   return (
//     <>
//       {scene ? (
//         <primitive 
//           ref={uavRef}
//           object={scene.clone()}
//           scale={[0.08, 0.08, 0.08]}
//           castShadow
//         />
//       ) : (
//         // Fallback mesh if no model is available
//         <mesh ref={uavRef}>
//           <boxGeometry args={[1, 0.2, 1]} />
//           <meshStandardMaterial color="red" />
//         </mesh>
//       )}
      
//       {/* Add damage effects */}
//       <UavDamageSystem position={position} />
      
//       {/* Engine thrust/exhaust effect based on mission state */}
//       {(missionState === 'moving' || missionState === 'returning') && (
//         <mesh position={[0, -0.5, -1.5]} scale={[0.5, 0.5, 2]}>
//           <coneGeometry args={[1, 2, 16]} />
//           <meshBasicMaterial color="#ff6600" transparent opacity={0.7} />
//         </mesh>
//       )}
      
//       {/* Missile system for visualizing missiles in flight */}
//       <MissileSystem />
      
//       {/* Target lock visualization */}
//       <TargetLockSystem />
      
//       {/* Launch effects for active missiles */}
//       {activeMissiles.filter(m => m.flightProgress < 0.1).map(missile => (
//         <MissileLaunch 
//           key={missile.id} 
//           position={missile.position} 
//         />
//       ))}
//     </>
//   );
// };

// useGLTF.preload('/models/surveillance-uav/drone.glb');

// export default AttackUAV;


import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useUAVStore } from '../../store/uavStore';
import { useAttackDroneStore } from '../../store/attackDroneStore';
import MissileSystem from './MissileSystem';
import TargetLockSystem from './TargetLockSystem';
import MissileLaunch from './WeaponryEffects/MissileLaunch';
import UavDamageSystem from '../anti-drone/UavDamageSystem';
import CrashedUAV from './CrashedUAV'; // Import the new component

const AttackUAV = () => {
  // Update the component to always start at the base position:
  const basePosition = [-45, 35, -40];
  const { position, rotation, speed, isCrashed, droneType } = useUAVStore();
  
  // Use surveillance drone model but with smaller scale until you have attack drone model
  const { scene } = useGLTF('/models/surveillance-uav/drone.glb');
  
  const uavRef = useRef();
  const { 
    activeMissiles, 
    updateMissiles, 
    initTargets, 
    updateMissionMovement,
    missionState,
    droneHealth,
    updateCrashAnimation // Add this new import
  } = useAttackDroneStore();
  
  // Initialize the targets and spawn attack UAV at base position when attack mode is first activated
  useEffect(() => {
    console.log("AttackUAV mounted - initializing targets and position");
    initTargets();
    
    // FIXED: Spawn attack UAV at base position when component mounts
    // Since AttackUAV component only renders in attack mode, we can spawn at base
    const currentPos = useUAVStore.getState().position;
    
    // Check if UAV is at default position (0, 50, 0) - indicating fresh spawn
    const isAtDefaultPosition = 
      Math.abs(currentPos[0]) < 0.1 && 
      Math.abs(currentPos[1] - 50) < 0.1 && 
      Math.abs(currentPos[2]) < 0.1;
    
    if (isAtDefaultPosition) {
      console.log("Spawning attack UAV at base position:", basePosition);
      useUAVStore.getState().setPosition(basePosition);
    }
  }, [initTargets]);
  
  useFrame((state, delta) => {
    // If in crashed state, update crash animation but don't position the main UAV model
    if (missionState === 'crashed') {
      // Update falling animation
      updateCrashAnimation(delta);
      return;
    }
    
    if (!uavRef.current) return;
    
    // Update UAV position based on store
    if (position && position.length === 3) {
      uavRef.current.position.set(...position);
    }
    
    // Update UAV rotation based on store
    if (rotation && rotation.length === 3) {
      uavRef.current.rotation.set(...rotation);
    }
    
    // Removed debugging from useFrame to reduce clutter
    
    // Update attack mission movement
    updateMissionMovement(delta);
    
    // Update missiles in flight
    updateMissiles(delta);
  });
  
  // CRITICAL DEBUG: Check missionState before render decision
  console.log('[AttackUAV] 🔍 RENDER DECISION CHECK:', {
    missionState: missionState,
    missionStateType: typeof missionState,
    isCrashedCheck: missionState === 'crashed',
    position: position
  });
  
  // If crashed, render the crashed UAV component
  if (missionState === 'crashed') {
    console.log('[AttackUAV] ✅ RENDERING CrashedUAV with position:', position);
    return <CrashedUAV position={position} />;
  }
  
  console.log('[AttackUAV] ❌ NOT CRASHED - Rendering normal AttackUAV');
  console.log('[AttackUAV] Mission state is:', missionState, 'Type:', typeof missionState);
  
  console.log('[AttackUAV] Rendering normal UAV, missionState:', missionState);
  
  return (
    <>
      {scene ? (
        <primitive 
          ref={uavRef}
          object={scene.clone()}
          scale={[0.08, 0.08, 0.08]}
          castShadow
        />
      ) : (
        // Fallback mesh if no model is available
        <mesh ref={uavRef}>
          <boxGeometry args={[1, 0.2, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
      
      {/* Add damage effects */}
      <UavDamageSystem position={position} />
      
      {/* Engine thrust/exhaust effect based on mission state */}
      {(missionState === 'moving' || missionState === 'returning') && (
        <mesh position={[0, -0.5, -1.5]} scale={[0.5, 0.5, 2]}>
          <coneGeometry args={[1, 2, 16]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.7} />
        </mesh>
      )}
      
      {/* Missile system for visualizing missiles in flight */}
      <MissileSystem />
      
      {/* Target lock visualization */}
      <TargetLockSystem />
      
      {/* Launch effects for active missiles */}
      {activeMissiles.filter(m => m.flightProgress < 0.1).map(missile => (
        <MissileLaunch 
          key={missile.id} 
          position={missile.position} 
        />
      ))}
    </>
  );
};

useGLTF.preload('/models/surveillance-uav/drone.glb');

export default AttackUAV;