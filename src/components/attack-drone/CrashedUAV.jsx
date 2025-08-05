// import React, { useEffect, useRef } from 'react';
// import { useFrame } from '@react-three/fiber';
// import * as THREE from 'three';
// import FireEffect from './FireEffect';

// const CrashedUAV = ({ position }) => {
//   const groupRef = useRef();
//   const debrisRef = useRef([]);
//   const smokeParticlesRef = useRef([]);
//   const lastUpdateTime = useRef(Date.now());
  
//   // Create debris pieces
//   useEffect(() => {
//     // Generate random debris
//     const debrisPieces = [];
    
//     // Create main crashed drone body
//     debrisPieces.push({
//       geometry: new THREE.BoxGeometry(0.8, 0.2, 1.2),
//       position: [0, 0.1, 0],
//       rotation: [Math.PI * 0.1, Math.PI * 0.2, Math.PI * 0.15],
//       color: '#333333'
//     });
    
//     // Create wings
//     debrisPieces.push({
//       geometry: new THREE.BoxGeometry(1.5, 0.1, 0.4),
//       position: [0, 0.15, 0.2],
//       rotation: [Math.PI * 0.2, 0, Math.PI * 0.3],
//       color: '#444444'
//     });
    
//     // Create broken rotor pieces
//     for (let i = 0; i < 4; i++) {
//       const angle = (i / 4) * Math.PI * 2;
//       debrisPieces.push({
//         geometry: new THREE.BoxGeometry(0.5, 0.05, 0.1),
//         position: [
//           Math.sin(angle) * 0.8,
//           0.2 + Math.random() * 0.1,
//           Math.cos(angle) * 0.8
//         ],
//         rotation: [
//           Math.random() * Math.PI,
//           Math.random() * Math.PI,
//           Math.random() * Math.PI
//         ],
//         color: '#222222'
//       });
//     }
    
//     // Create small scattered debris
//     for (let i = 0; i < 8; i++) {
//       debrisPieces.push({
//         geometry: new THREE.BoxGeometry(
//           Math.random() * 0.2 + 0.1,
//           Math.random() * 0.1 + 0.05,
//           Math.random() * 0.2 + 0.1
//         ),
//         position: [
//           (Math.random() - 0.5) * 2,
//           Math.random() * 0.2,
//           (Math.random() - 0.5) * 2
//         ],
//         rotation: [
//           Math.random() * Math.PI,
//           Math.random() * Math.PI,
//           Math.random() * Math.PI
//         ],
//         color: '#3a3a3a'
//       });
//     }
    
//     debrisRef.current = debrisPieces;
    
//     // Create smoke particles
//     const smokeParticles = [];
//     for (let i = 0; i < 10; i++) {
//       smokeParticles.push({
//         position: [
//           (Math.random() - 0.5) * 1,
//           Math.random() * 0.5,
//           (Math.random() - 0.5) * 1
//         ],
//         scale: Math.random() * 0.6 + 0.4,
//         speed: Math.random() * 0.8 + 0.2,
//         opacity: Math.random() * 0.4 + 0.2
//       });
//     }
//     smokeParticlesRef.current = smokeParticles;
//   }, []);
  
//   // Animate smoke
//   useFrame((state) => {
//     const now = Date.now();
//     const deltaTime = (now - lastUpdateTime.current) / 1000;
//     lastUpdateTime.current = now;
    
//     // Update smoke particles
//     if (groupRef.current) {
//       smokeParticlesRef.current.forEach((particle, i) => {
//         // Rise upward
//         particle.position[1] += particle.speed * deltaTime;
        
//         // If too high, reset to ground
//         if (particle.position[1] > 4) {
//           particle.position = [
//             (Math.random() - 0.5) * 1,
//             Math.random() * 0.5,
//             (Math.random() - 0.5) * 1
//           ];
//         }
        
//         // Update in the scene
//         const smokeMesh = groupRef.current.children.find(c => c.name === `smoke-${i}`);
//         if (smokeMesh) {
//           smokeMesh.position.set(...particle.position);
          
//           // Pulse the opacity
//           const pulseSpeed = 0.5;
//           const pulseAmount = 0.2;
//           smokeMesh.material.opacity = particle.opacity + 
//             Math.sin(state.clock.elapsedTime * pulseSpeed + i) * pulseAmount;
//         }
//       });
//     }
//   });

//   return (
//     <group position={position} ref={groupRef}>
//       {/* Render debris pieces */}
//       {debrisRef.current.map((debris, i) => (
//         <mesh 
//           key={`debris-${i}`}
//           geometry={debris.geometry}
//           position={debris.position}
//           rotation={debris.rotation}
//         >
//           <meshStandardMaterial 
//             color={debris.color}
//             roughness={0.9}
//           />
//         </mesh>
//       ))}
      
//       {/* Render smoke particles */}
//       {smokeParticlesRef.current.map((particle, i) => (
//         <mesh
//           key={`smoke-${i}`}
//           name={`smoke-${i}`}
//           position={particle.position}
//           scale={[particle.scale, particle.scale, particle.scale]}
//         >
//           <sphereGeometry args={[0.5, 8, 8]} />
//           <meshStandardMaterial
//             color="#333333"
//             transparent
//             opacity={particle.opacity}
//             depthWrite={false}
//           />
//         </mesh>
//       ))}
      
//       {/* Fire effect */}
//       <FireEffect 
//         position={[0, 0.2, 0]} 
//         intensity={1.2}
//         duration={Infinity} // Continuous fire
//       />
//     </group>
//   );
// };

// export default CrashedUAV;


import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import FireEffect from './FireEffect';

const CrashedUAV = ({ position }) => {
  console.log('[CrashedUAV] Component rendered with position:', position);

  const groupRef = useRef();
  const debrisRef = useRef([]);
  const smokeParticlesRef = useRef([]);
  const lastUpdateTime = useRef(Date.now());
  
  // Create debris pieces
  useEffect(() => {
    // Generate random debris
    const debrisPieces = [];
    
    // Create main crashed drone body - MUCH LARGER AND MORE VISIBLE
    debrisPieces.push({
      geometry: new THREE.BoxGeometry(4, 1, 6), // Much larger
      position: [0, 2, 0], // Higher up so it's visible
      rotation: [Math.PI * 0.1, Math.PI * 0.2, Math.PI * 0.15],
      color: '#ff0000' // Bright red for visibility
    });
    
    // Create wings - LARGER
    debrisPieces.push({
      geometry: new THREE.BoxGeometry(8, 0.5, 2), // Much larger
      position: [0, 2.5, 1],

      rotation: [Math.PI * 0.2, 0, Math.PI * 0.3],
      color: '#ff8800' // Bright orange for visibility
    });
    
    // Create broken rotor pieces - LARGER AND MORE VISIBLE
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      debrisPieces.push({
        geometry: new THREE.BoxGeometry(2, 0.3, 0.5), // Much larger
        position: [
          Math.sin(angle) * 4,
          2 + Math.random() * 0.5,
          Math.cos(angle) * 4
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ],
        color: '#ffff00' // Bright yellow for visibility
      });
    }
    
    // Create small scattered debris
    for (let i = 0; i < 8; i++) {
      debrisPieces.push({
        geometry: new THREE.BoxGeometry(
          Math.random() * 0.2 + 0.1,
          Math.random() * 0.1 + 0.05,
          Math.random() * 0.2 + 0.1
        ),
        position: [
          (Math.random() - 0.5) * 2,
          Math.random() * 0.2,
          (Math.random() - 0.5) * 2
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ],
        color: '#3a3a3a'
      });
    }
    
    debrisRef.current = debrisPieces;
    
    // Create smoke particles
    const smokeParticles = [];
    for (let i = 0; i < 10; i++) {
      smokeParticles.push({
        position: [
          (Math.random() - 0.5) * 1,
          Math.random() * 0.5,
          (Math.random() - 0.5) * 1
        ],
        scale: Math.random() * 0.6 + 0.4,
        speed: Math.random() * 0.8 + 0.2,
        opacity: Math.random() * 0.4 + 0.2
      });
    }
    smokeParticlesRef.current = smokeParticles;
  }, []);
  
  // Animate smoke
  useFrame((state) => {
    const now = Date.now();
    const deltaTime = (now - lastUpdateTime.current) / 1000;
    lastUpdateTime.current = now;
    
    // Update smoke particles
    if (groupRef.current) {
      smokeParticlesRef.current.forEach((particle, i) => {
        // Rise upward
        particle.position[1] += particle.speed * deltaTime;
        
        // If too high, reset to ground
        if (particle.position[1] > 4) {
          particle.position = [
            (Math.random() - 0.5) * 1,
            Math.random() * 0.5,
            (Math.random() - 0.5) * 1
          ];
        }
        
        // Update in the scene
        const smokeMesh = groupRef.current.children.find(c => c.name === `smoke-${i}`);
        if (smokeMesh) {
          smokeMesh.position.set(...particle.position);
          
          // Pulse the opacity
          const pulseSpeed = 0.5;
          const pulseAmount = 0.2;
          smokeMesh.material.opacity = particle.opacity + 
            Math.sin(state.clock.elapsedTime * pulseSpeed + i) * pulseAmount;
        }
      });
    }
  });

  return (
    <group position={position} ref={groupRef}>
      {/* Render debris pieces */}
      {debrisRef.current.map((debris, i) => (
        <mesh 
          key={`debris-${i}`}
          geometry={debris.geometry}
          position={debris.position}
          rotation={debris.rotation}
        >
          <meshStandardMaterial 
            color={debris.color}
            roughness={0.9}
          />
        </mesh>
      ))}
      
      {/* Render smoke particles */}
      {smokeParticlesRef.current.map((particle, i) => (
        <mesh
          key={`smoke-${i}`}
          name={`smoke-${i}`}
          position={particle.position}
          scale={[particle.scale, particle.scale, particle.scale]}
        >
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial
            color="#333333"
            transparent
            opacity={particle.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
      
      {/* Fire effect */}
      <FireEffect 
        position={[0, 0.2, 0]} 
        intensity={1.2}
        duration={Infinity} // Continuous fire
      />
    </group>
  );
};

export default CrashedUAV;