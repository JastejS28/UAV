import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DefenseProjectile = ({ startPosition, targetPosition, onComplete }) => {
  const projectileRef = useRef();
  const startTime = useRef(Date.now());
  const flightDuration = 1.0; // 1 second flight time
  const trailPoints = useRef([]);
  const trailRefs = useRef([]); // Refs for each trail segment

  useFrame((state) => {
    if (!projectileRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = Math.min(elapsed / flightDuration, 1);

    // Linear interpolation for position
    const start = new THREE.Vector3(...startPosition);
    const end = new THREE.Vector3(...targetPosition);
    const currentPos = new THREE.Vector3().lerpVectors(start, end, progress);
    projectileRef.current.position.copy(currentPos);

    // Add a new point to the trail
    if (progress < 1) {
        trailPoints.current.push({
            position: currentPos.clone(),
            time: state.clock.elapsedTime
        });
        if (trailPoints.current.length > 15) {
            trailPoints.current.shift();
        }
    }
    
    // Update opacity of existing trail segments
    trailRefs.current.forEach((ref, index) => {
        if (ref) {
            const point = trailPoints.current[index];
            if (point) {
                const age = state.clock.elapsedTime - point.time;
                ref.material.opacity = Math.max(0, 0.8 - age * 2);
            }
        }
    });

    if (progress >= 1) {
      onComplete?.();
    }
  });

  return (
    <group>
      <mesh ref={projectileRef}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
      
      {/* Render trail points */}
      {trailPoints.current.map((point, i) => (
        <mesh key={i} ref={el => trailRefs.current[i] = el} position={point.position}>
          <sphereGeometry args={[0.1, 4, 4]} />
          <meshBasicMaterial
            color="yellow"
            transparent={true}
            opacity={0.8} 
          />
        </mesh>
      ))}
    </group>
  );
};

export default DefenseProjectile;