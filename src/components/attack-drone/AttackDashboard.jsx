// import React, { useState, useEffect } from 'react';
// import { Box, Paper, Typography, Button, Badge, Chip, Stack, LinearProgress, Divider, Alert, TextField, Grid, Slider } from '@mui/material';
// import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
// import FlightLandIcon from '@mui/icons-material/FlightLand';
// import GpsFixedIcon from '@mui/icons-material/GpsFixed';
// import MissileIcon from '@mui/icons-material/RocketLaunch';
// import HomeIcon from '@mui/icons-material/Home';
// import WarningIcon from '@mui/icons-material/Warning';
// import SecurityIcon from '@mui/icons-material/Security';
// import BlockIcon from '@mui/icons-material/Block';
// import { useUAVStore } from '../../store/uavStore';
// import { useAttackDroneStore } from '../../store/attackDroneStore';
// import { useTargetStore } from '../../store/targetStore';
// import { useMissionStore } from '../../store/missionStore';
// import DamageAssessment from './DamageAssessment';
// import LockOnProgress from './LockOnProgress'

// // Constants for defense system
// const RADAR_RADIUS = 50; // Detection range
// const MIN_SAFE_ALTITUDE = 20; // Below this height, UAV is undetectable

// const AttackDashboard = () => {
//   // FIX: Add 'targets' to the destructuring assignment to make it available in the component.
//   const { position, setPosition, setTargetPosition, targets } = useUAVStore();
//   const { 
//     missionState, beginMission, returnToBase, fireMissile, 
//     targeting, beginTargetLock, targetingJammed, selectedWeapon, 
//     ammoCount, setDroneDamage, droneHealth, communicationsJammed,
//     attackPosition, homeBase // FIX: Add missing variables
//   } = useAttackDroneStore();

//   // ADDED: Get mission time tracking from mission store
//   const { 
//     missionStatus: currentMissionStatus, // FIXED: Rename to avoid conflict with missionState
//     missionTimeRemaining, 
//     missionDuration,
//     missionType 
//   } = useMissionStore();

//   // State for coordinate input fields
//   const [coordinates, setCoordinates] = useState({ x: '', y: '', z: '' });
//   // State for defense system detection
//   const [isDefenseSystemDetected, setIsDefenseSystemDetected] = useState(false);
//   const [altitudeSlider, setAltitudeSlider] = useState(position ? position[1] : 35);
//   // ADDED: State for firing error messages
//   const [firingError, setFiringError] = useState(null);

//   // FIXED: Update altitude slider when position changes
//   useEffect(() => {
//     if (position && position[1] !== altitudeSlider) {
//       setAltitudeSlider(position[1]);
//     }
//   }, [position]);

//   // ADDED: Format time function for mission timer
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Check if UAV is in defense system range and above minimum altitude
//   useEffect(() => {
//     if (!position) return;

//     // Get UAV position and calculate if it's within defense range
//     const warehousePos = [40, 20, 35]; // Warehouse position where defense system is

//     const distance = Math.sqrt(
//       Math.pow(warehousePos[0] - position[0], 2) +
//       Math.pow(warehousePos[2] - position[2], 2) // Only check X-Z plane distance
//     );

//     const uavAltitude = position[1];

//     // Detect if UAV is within range and above minimum altitude
//     const detected = distance < RADAR_RADIUS && uavAltitude > MIN_SAFE_ALTITUDE;
//     setIsDefenseSystemDetected(detected);

//   }, [position]);

//   // Handle moving to coordinates then preparing to fire
//   const handleCoordinateSubmit = () => {
//     // Parse and validate input values
//     const rawX = parseFloat(coordinates.x);
//     const rawY = parseFloat(coordinates.y);
//     const rawZ = parseFloat(coordinates.z);

//     // Check if they are valid numbers
//     if (isNaN(rawX) || isNaN(rawY) || isNaN(rawZ)) {
//       console.warn("Invalid coordinate values. Please enter numbers.");
//       return;
//     }

//     // Apply limits for coordinates
//     const x = Math.min(Math.max(rawX, -50), 50);
//     const y = Math.min(Math.max(rawY, 10), 100);
//     const z = Math.min(Math.max(rawZ, -50), 50);

//     // Update the input fields with validated values
//     setCoordinates({
//       x: x.toString(),
//       y: y.toString(),
//       z: z.toString()
//     });

//     // Set the target position and initiate movement
//     useAttackDroneStore.getState().moveToPosition([x, y, z]);
//     console.log("UAV moving to position:", [x, y, z]);
//   };

//   // Handle target selection
//   const handleSelectTarget = (targetId) => {
//     if (missionState !== 'attacking' || targetingJammed) {
//       console.log("Cannot select target - UAV must be in attack position and systems must be online.");
//       return;
//     }

//     // Begin target lock process from the store
//     console.log("Attempting to lock on target:", targetId);
//     beginTargetLock(targetId);
//   };

//   // Calculate distance between UAV and target
//   const calculateDistance = (targetPosition) => {
//     if (!targetPosition || !position || targetPosition.length < 3 || position.length < 3) {
//       return 0;
//     }
//     return Math.sqrt(
//       Math.pow(targetPosition[0] - position[0], 2) +
//       Math.pow(targetPosition[1] - position[1], 2) +
//       Math.pow(targetPosition[2] - position[2], 2)
//     ).toFixed(2);
//   };
  
//   // Handle coordinate input changes
//   const handleCoordinateChange = (axis, value) => {
//     // Just update the state with whatever the user types - no immediate validation
//     setCoordinates({
//       ...coordinates,
//       [axis]: value
//     });
//   };
  
//   // Then in the same file, add this function for validating on blur
//   const handleCoordinateBlur = (axis) => {
//     const value = coordinates[axis];
    
//     // Skip validation for empty values
//     if (value === '' || value === '-') return;
    
//     const numValue = parseFloat(value);
    
//     // Skip validation if not a number
//     if (isNaN(numValue)) return;
    
//     let validatedValue;
    
//     // Apply limits based on axis
//     switch(axis) {
//       case 'x':
//       case 'z':
//         validatedValue = Math.min(Math.max(numValue, -50), 50);
//         break;
//       case 'y':
//         validatedValue = Math.min(Math.max(numValue, 10), 100);
//         break;
//       default:
//         validatedValue = numValue;
//     }
    
//     // Only update if the validated value is different from the input
//     if (validatedValue !== numValue) {
//       setCoordinates(prev => ({
//         ...prev,
//         [axis]: validatedValue.toString()
//       }));
//     }
//   };
  
//   // Get mission status information
//   const getMissionStatusInfo = () => {
//     switch(missionState) {
//       case 'moving':
//         return {
//           label: 'MOVING TO ATTACK POSITION',
//           color: '#ff9800',
//           icon: <FlightTakeoffIcon />,
//           description: 'Flying to optimal attack position'
//         };
//       case 'attacking':
//         return {
//           label: 'ATTACK POSITION REACHED',
//           color: '#f44336',
//           icon: <MissileIcon />,
//           description: 'Ready to engage target'
//         };
//       case 'returning':
//         return {
//           label: 'RETURNING TO BASE',
//           color: '#2196f3',
//           icon: <FlightLandIcon />,
//           description: 'Mission complete, returning home'
//         };
//       case 'crashed':
//         return {
//           label: 'DRONE CRASHED',
//           color: '#d32f2f', // deep red
//           icon: <WarningIcon />,
//           description: 'UAV destroyed by defense systems'
//         };
//       default:
//         return {
//           label: 'STANDBY',
//           color: '#757575',
//           icon: <HomeIcon />,
//           description: 'Ready for mission assignment'
//         };
//     }
//   };
  
//   const missionStatus = getMissionStatusInfo();
  
//   // Handle anti-drone defensive system attack on UAV
//   const handleAntiDroneAttack = () => {
//     // Only works if UAV is detected (above MIN_SAFE_ALTITUDE and in range)
//     if (isDefenseSystemDetected) {
//       // Destroy the UAV - set health to 0 and trigger destroyed state
//       useAttackDroneStore.getState().setDroneDamage({ 
//         type: 'hit', 
//         damage: 100 // Full damage to destroy
//       });
//       console.log("Anti-drone defense system destroyed the UAV!");
//     }
//   };
  
//   // Get detected targets from the target store
//   const detectedTargets = useTargetStore(state => state.detectedTargets || []);
  
//   // Filter targets for display
//   const availableTargets = targets.filter(target => 
//     // Check if this target is in the detected targets list
//     detectedTargets.some(detected => 
//       detected.id === target.id || 
//       (Math.abs(detected.position[0] - target.position[0]) < 2 && 
//        Math.abs(detected.position[2] - target.position[2]) < 2)
//     )
//   );
  
//   // FIXED: Update altitude change handlers to properly manage slider state
//   const handleAltitudeChange = (event, newValue) => {
//     // Update slider state immediately for smooth sliding
//     setAltitudeSlider(newValue);
//     // Set the new position directly
//     setPosition([position[0], newValue, position[2]]);
//     // CRITICAL: Clear the target position to prevent UAVController from overriding this manual change.
//     setTargetPosition(null);
//   };

//   const handleAltitudeChangeCommitted = (event, newValue) => {
//     // Ensure final position is set when slider interaction is complete
//     setPosition([position[0], newValue, position[2]]);
//     setAltitudeSlider(newValue);
//   };
  
//   const targetingData = {
//     selectedTarget: targeting?.lockedTarget 
//       ? targets.find(t => t.id === targeting.lockedTarget)
//       : null,
//     lockStatus: targeting?.lockStatus || 'inactive',
//     lockProgress: targeting?.lockTimer / (targeting?.maxLockTime || 1)
//   };

//   // ADDED: Function to check weapon-specific firing conditions
//   const checkFiringConditions = () => {
//     if (!targeting.lockedTarget || !availableTargets.length) return null;
    
//     const target = availableTargets.find(t => t.id === targeting.lockedTarget);
//     if (!target) return null;
    
//     const distanceToTarget = Math.sqrt(
//       Math.pow(position[0] - target.position[0], 2) +
//       Math.pow(position[2] - target.position[2], 2)
//     );
    
//     // UPDATED: General distance check for both weapons (realism requirement)
//     if (distanceToTarget > 20) {
//       return {
//         canFire: false,
//         error: "Move within 20 meters of target to engage",
//         requiredDistance: 20,
//         currentDistance: distanceToTarget.toFixed(1)
//       };
//     }
    
//     if (selectedWeapon === 'bomb') {
//       // Bombs require UAV to be directly above target (within 10 meters horizontally)
//       if (distanceToTarget > 10) {
//         return {
//           canFire: false,
//           error: "Position UAV directly above target to drop bombs",
//           requiredDistance: 10,
//           currentDistance: distanceToTarget.toFixed(1)
//         };
//       }
      
//       // ADDED: Check if UAV is at appropriate altitude above target
//       const altitudeDifference = Math.abs(position[1] - target.position[1]);
//       if (altitudeDifference < 15) {
//         return {
//           canFire: false,
//           error: "Gain altitude above target for safe bomb deployment",
//           requiredAltitude: "15m above target",
//           currentAltitude: altitudeDifference.toFixed(1) + "m"
//         };
//       }
//     }
    
//     return { canFire: true };
//   };

//   const firingCondition = checkFiringConditions();

//   return (
//     <Paper sx={{ p: 2, m: 2, maxWidth: 400 }}>
//       <Typography variant="h6" gutterBottom>
//         Attack Drone Command
//       </Typography>
      
//       {/* ADDED: Mission Time Bar - Similar to CommandDashboard */}
//       {(currentMissionStatus === 'active' || missionTimeRemaining > 0) && (
//         <Paper 
//           elevation={2} 
//           sx={{ 
//             mb: 2, 
//             p: 2, 
//             backgroundColor: 'rgba(0,0,0,0.8)', 
//             borderRadius: 2,
//             border: '1px solid rgba(255,69,0,0.3)',
//           }}
//         >
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
//             <Box sx={{ display: 'flex', alignItems: 'center' }}>
//               <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
//                 <Box component="span" sx={{ color: '#ff4500', mr: 1 }}>⚡</Box>
//                 {missionType === 'surveillance' ? 'Surveillance & Attack' : 'Attack Mission'}
//               </Typography>
//             </Box>
//             <Chip 
//               label={currentMissionStatus === 'active' ? 'ACTIVE' : 'STANDBY'} 
//               size="small" 
//               sx={{ 
//                 bgcolor: currentMissionStatus === 'active' ? 'error.main' : 'warning.main',
//                 color: 'white',
//                 fontWeight: 'bold'
//               }} 
//             />
//           </Box>
          
//           <Box sx={{ mb: 1 }}>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
//               <Typography variant="body2" sx={{ color: '#ccc' }}>Mission Time</Typography>
//               <Typography variant="body2" sx={{ color: missionTimeRemaining < 20 ? '#ff3d00' : '#ff4500', fontWeight: 'bold' }}>
//                 {formatTime(missionTimeRemaining)} remaining
//               </Typography>
//             </Box>
//             <LinearProgress 
//               variant="determinate" 
//               value={missionDuration > 0 ? (missionTimeRemaining / missionDuration) * 100 : 0}
//               sx={{ 
//                 height: 8, 
//                 borderRadius: 1,
//                 backgroundColor: 'rgba(0,0,0,0.3)',
//                 '& .MuiLinearProgress-bar': {
//                   backgroundColor: missionTimeRemaining < 20 ? '#ff3d00' : '#ff4500'
//                 }
//               }} 
//             />
//           </Box>
//         </Paper>
//       )}
      
//       {/* Add Coordinate Controls */}
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="subtitle1" gutterBottom>
//           UAV Position Controls
//         </Typography>
//         <Grid container spacing={2}>
//           <Grid item xs={4}>
//             <TextField
//               label="X"
//               type="number"
//               value={coordinates.x}
//               onChange={(e) => handleCoordinateChange('x', e.target.value)}
//               onBlur={() => handleCoordinateBlur('x')}
//               size="small"
//               fullWidth
//               placeholder="X (-50 to 50)"
//               // Remove the inputProps that restrict input
//               // inputProps={{ min: -50, max: 50 }}
//             />
//           </Grid>
//           <Grid item xs={4}>
//             <TextField
//               label="Y"
//               type="number"
//               value={coordinates.y}
//               onChange={(e) => handleCoordinateChange('y', e.target.value)}
//               onBlur={() => handleCoordinateBlur('y')}
//               size="small"
//               fullWidth
//               placeholder="Y (10 to 100)"
//               // Remove the inputProps that restrict input
//               // inputProps={{ min: 10, max: 100 }}
//               helperText={parseFloat(coordinates.y) < MIN_SAFE_ALTITUDE ? "Stealth" : ""}
//             />
//           </Grid>
//           <Grid item xs={4}>
//             <TextField
//               label="Z"
//               type="number"
//               value={coordinates.z}
//               onChange={(e) => handleCoordinateChange('z', e.target.value)}
//               onBlur={() => handleCoordinateBlur('z')}
//               size="small"
//               fullWidth
//               placeholder="Z (-50 to 50)"
//               // Remove the inputProps that restrict input
//               // inputProps={{ min: -50, max: 50 }}
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <Button 
//               variant="contained" 
//               onClick={handleCoordinateSubmit} 
//               fullWidth
//               disabled={missionState !== 'idle'}
//             >
//               Set Position
//             </Button>
//           </Grid>
//           <Grid item xs={12}>
//             <Typography variant="caption" color="text.secondary">
//               Current: {position ? `[${position.map(n => Math.floor(n)).join(', ')}]` : 'Unknown'}
//               {position && position[1] < MIN_SAFE_ALTITUDE && (
//                 <Chip
//                   label="STEALTH MODE"
//                   size="small"
//                   color="success"
//                   sx={{ ml: 1, height: 20 }}
//                 />
//               )}
//             </Typography>
//           </Grid>
//         </Grid>
//       </Box>
      
//       {/* Mission Status */}
//       <Box sx={{ mb: 3, p: 1, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//           <Box sx={{ mr: 1, color: missionStatus.color }}>{missionStatus.icon}</Box>
//           <Typography variant="subtitle1" color={missionStatus.color} fontWeight="bold">
//             {missionStatus.label}
//           </Typography>
//         </Box>
//         <Typography variant="body2" color="text.secondary">
//           {missionStatus.description}
//         </Typography>
        
//         {/* Position information */}
//         <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
//           <div>Current: {position ? `[${position.map(n => Math.floor(n)).join(', ')}]` : 'Unknown'}</div>
//           {missionState === 'moving' && attackPosition && (
//             <div>Target: [{attackPosition.map(n => Math.floor(n)).join(', ')}]</div>
//           )}
//           {missionState === 'returning' && homeBase && (
//             <div>Base: [{homeBase.map(n => Math.floor(n)).join(', ')}]</div>
//           )}
//         </Box>
        
//         {/* Return to base button */}
//         {(missionState === 'attacking' || missionState === 'moving') && (
//           <Button 
//             variant="outlined" 
//             size="small"
//             startIcon={<HomeIcon />}
//             onClick={returnToBase}
//             sx={{ mt: 1 }}
//           >
//             Return To Base
//           </Button>
//         )}
//       </Box>

//       {/* Weapons System */}
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="subtitle1" gutterBottom>
//           Weapons System
//         </Typography>
//         <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
//           <Button 
//             variant="contained"
//             color={selectedWeapon === 'missile' ? 'primary' : 'inherit'}
//             onClick={() => selectWeapon('missile')}
//             disabled={missionState !== 'idle' && missionState !== 'attacking'}
//             sx={{ 
//               bgcolor: selectedWeapon === 'missile' ? '#90caf9' : 'transparent',
//               '&:hover': { bgcolor: selectedWeapon === 'missile' ? '#64b5f6' : '#424242' }
//             }}
//           >
//             MISSILES
//             <Badge 
//               badgeContent={ammoCount.missile} 
//               color="error"
//               sx={{ ml: 1 }}
//             />
//           </Button>
//           <Button 
//             variant="contained"
//             color={selectedWeapon === 'bomb' ? 'primary' : 'inherit'}
//             onClick={() => selectWeapon('bomb')}
//             disabled={missionState !== 'idle' && missionState !== 'attacking'}
//             sx={{ 
//               bgcolor: selectedWeapon === 'bomb' ? '#90caf9' : 'transparent',
//               '&:hover': { bgcolor: selectedWeapon === 'bomb' ? '#64b5f6' : '#424242' }
//             }}
//           >
//             BOMBS
//             <Badge 
//               badgeContent={ammoCount.bomb} 
//               color="error"
//               sx={{ ml: 1 }}
//             />
//           </Button>
//         </Stack>
//       </Box>
      
//       {/* Target Acquisition */}
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="subtitle1" gutterBottom>
//           Target Acquisition
//         </Typography>
        
//         {targeting.lockStatus !== 'inactive' && (
//           <Box sx={{ mb: 2 }}>
//             <Typography variant="subtitle2">Lock Status:</Typography>
//             <LockOnProgress 
//               status={targeting.lockStatus} 
//               progress={targeting.lockTimer / targeting.maxLockTime} 
//             />
//           </Box>
//         )}
        
//         {/* DUPLICATE FIRE BUTTON REMOVED - Using the improved version in Weapon Systems section below */}
        
//         {/* Target list */}
//         <Typography variant="subtitle2" gutterBottom>
//           Available Targets:
//         </Typography>
        
//         {Array.isArray(availableTargets) && availableTargets.length > 0 ? (
//           availableTargets.map((target) => (
//             <div 
//               key={target.id} 
//               style={{ 
//                 padding: '8px',
//                 marginBottom: '8px',
//                 backgroundColor: targeting.lockedTarget === target.id ? '#ffebee' : '#f5f5f5',
//                 border: targeting.lockedTarget === target.id ? '1px solid #f44336' : '1px solid #ccc',
//                 borderRadius: '4px',
//                 cursor: missionState === 'attacking' ? 'pointer' : 'default',
//                 opacity: missionState === 'attacking' ? 1 : 0.7
//               }}
//               onClick={() => missionState === 'attacking' && handleSelectTarget(target.id)}
//             >
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'black' }}>
//                   {target.type.charAt(0).toUpperCase() + target.type.slice(1)}
//                 </Typography>
//                 <Chip
//                   label={targeting.lockedTarget === target.id ? '🔒 LOCKED' : '🎯 SELECT'}
//                   size="small"
//                   color={targeting.lockedTarget === target.id ? 'success' : 'primary'}
//                   variant={targeting.lockedTarget === target.id ? 'filled' : 'outlined'}
//                   disabled={missionState !== 'attacking' || targetingJammed}
//                   icon={<GpsFixedIcon fontSize="small" />}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     console.log('SELECT button clicked:', {
//                       targetId: target.id,
//                       missionState,
//                       targetingJammed,
//                       currentLock: targeting.lockedTarget
//                     });
//                     if (missionState === 'attacking' && !targetingJammed) {
//                       handleSelectTarget(target.id);
//                     }
//                   }}
//                   sx={{
//                     cursor: (missionState === 'attacking' && !targetingJammed) ? 'pointer' : 'not-allowed',
//                     '&:hover': {
//                       backgroundColor: targeting.lockedTarget === target.id ? 'success.dark' : 'primary.light'
//                     },
//                     ...(targeting.lockedTarget !== target.id && {
//                       borderColor: 'primary.main',
//                       color: 'primary.main',
//                       '.MuiChip-icon': {
//                         color: 'primary.main'
//                       }
//                     })
//                   }}
//                 />
//               </Box>
//               <Typography variant="body2" color='black'>
//                 Distance: {calculateDistance(target.position)} m
//               </Typography>
//             </div>
//           ))
//         ) : (
//           <Typography variant="body2" color="text.secondary">
//             No targets detected in range.
//           </Typography>
//         )}
//       </Box>

//       {/* Damage Assessment */}
//       <DamageAssessment />

//       {/* Defense System Warning */}
//       {isDefenseSystemDetected && (
//         <Box sx={{
//           mb: 2,
//           p: 1,
//           bgcolor: 'rgba(255,0,0,0.15)',
//           borderRadius: 1,
//           border: '1px solid #f44336'
//         }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//             <WarningIcon color="error" sx={{ mr: 1 }} />
//             <Typography variant="subtitle1" color="error" fontWeight="bold">
//               DEFENSE SYSTEM DETECTED
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary">
//             Anti-aircraft defenses operational. Fly below {MIN_SAFE_ALTITUDE}m altitude to avoid detection.
//           </Typography>
//           {droneHealth < 100 && (
//             <LinearProgress
//               variant="determinate"
//               value={droneHealth}
//               sx={{
//                 mt: 1,
//                 height: 10,
//                 borderRadius: 1,
//                 backgroundColor: 'rgba(255,255,255,0.2)',
//                 '& .MuiLinearProgress-bar': {
//                   backgroundColor: droneHealth > 70 ? '#4caf50' :
//                     droneHealth > 30 ? '#ff9800' : '#f44336'
//                 }
//               }}
//             />
//           )}

//           {/* Anti-Drone Attack Button */}
//           <Button
//             variant="contained"
//             color="error"
//             fullWidth
//             sx={{ mt: 1 }}
//             onClick={handleAntiDroneAttack}
//           >
//             ACTIVATE DEFENSE SYSTEM
//           </Button>
//         </Box>
//       )}

//       {/* System Malfunction Warnings */}
//       {communicationsJammed && (
//         <Alert
//           severity="error"
//           icon={<BlockIcon />}
//           sx={{ mb: 2 }}
//         >
//           COMMUNICATIONS JAMMED - Control systems impaired
//         </Alert>
//       )}

//       {targetingJammed && (
//         <Alert
//           severity="error"
//           icon={<BlockIcon />}
//           sx={{ mb: 2 }}
//         >
//           TARGETING SYSTEMS JAMMED - Weapons systems offline
//         </Alert>
//       )}

//       {/* Altitude Control Panel - NEW SECTION */}
//       <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #444' }}>
//         <Typography variant="h6" gutterBottom sx={{ color: '#ff9800' }}>
//           ⛰️ Attack Altitude Control
//         </Typography>
        
//         <Typography variant="body2" sx={{ color: 'white' }} gutterBottom>
//           Current Altitude: {Math.floor(position[1])}m
//         </Typography>
        
//         <Box sx={{ px: 1, py: 2 }}>
//           <Slider
//             value={altitudeSlider}
//             onChange={handleAltitudeChange}
//             onChangeCommitted={handleAltitudeChangeCommitted}
//             min={10}
//             max={100}
//             step={1}
//             marks={[
//               { value: 10, label: '10m' },
//               { value: 20, label: 'th' },
//               { value: 50, label: '50m' },
//               { value: 100, label: '100m' }
//             ]}
//             valueLabelDisplay="on"
//             valueLabelFormat={(value) => `${value}m`}
//             sx={{
//               color: droneHealth < 50 ? 'error.main' : '#ff9800',
//               '& .MuiSlider-thumb': {
//                 backgroundColor: droneHealth < 50 ? 'error.main' : '#ff9800'
//               },
//               '& .MuiSlider-track': {
//                 backgroundColor: droneHealth < 50 ? 'error.main' : '#ff9800'
//               },
//               '& .MuiSlider-markLabel': {
//                 color: '#ccc',
//                 fontSize: '0.7rem',
//                 whiteSpace: 'nowrap'
//               }
//             }}
//           />
//         </Box>
        
//         <Typography variant="caption" display="block" sx={{ mt: 1, color: '#aaa' }}>
//           Higher altitude (35-50m) reduces detection by defenses but decreases weapon accuracy
//         </Typography>
//         <Typography variant="caption" display="block" sx={{ color: '#aaa' }}>
//           Lower altitude (15-25m) increases weapon accuracy but increases detection risk
//         </Typography>
//       </Paper>

//       {/* Weapon System Controls - NEW SECTION */}
//       <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #444' }}>
//         <Typography variant="h6" gutterBottom sx={{ color: '#f44336' }}>
//           🚀 Weapon Systems
//         </Typography>
        
//         {/* Weapon Selection */}
//         <Box sx={{ mb: 2 }}>
//           <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>Selected Weapon:</Typography>
//           <Grid container spacing={1}>
//             <Grid item xs={6}>
//               <Button
//                 fullWidth
//                 variant={selectedWeapon === 'missile' ? 'contained' : 'outlined'}
//                 color={selectedWeapon === 'missile' ? 'error' : 'inherit'}
//                 size="small"
//                 onClick={() => useAttackDroneStore.getState().setWeaponConfig({ selectedWeapon: 'missile' })}
//                 disabled={ammoCount.missile <= 0}
//               >
//                 Missile ({ammoCount.missile})
//               </Button>
//             </Grid>
//             <Grid item xs={6}>
//               <Button
//                 fullWidth
//                 variant={selectedWeapon === 'bomb' ? 'contained' : 'outlined'}
//                 color={selectedWeapon === 'bomb' ? 'error' : 'inherit'}
//                 size="small"
//                 onClick={() => useAttackDroneStore.getState().setWeaponConfig({ selectedWeapon: 'bomb' })}
//                 disabled={ammoCount.bomb <= 0}
//               >
//                 Bomb ({ammoCount.bomb})
//               </Button>
//             </Grid>
//           </Grid>
//         </Box>

//         {/* Target Lock Status */}
//         <Box sx={{ mb: 2 }}>
//           <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>Target Lock:</Typography>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <Chip
//               label={targeting.lockStatus === 'locked' ? 'LOCKED' : targeting.lockStatus === 'locking' ? 'LOCKING...' : 'NO LOCK'}
//               color={targeting.lockStatus === 'locked' ? 'success' : targeting.lockStatus === 'locking' ? 'warning' : 'default'}
//               size="small"
//             />
//             {targeting.lockStatus === 'locking' && (
//               <LinearProgress
//                 variant="determinate"
//                 value={(targeting.lockTimer / 3) * 100}
//                 sx={{ flexGrow: 1, height: 6, borderRadius: 1 }}
//               />
//             )}
//           </Box>
//         </Box>

//         {/* SINGLE FIRE CONTROL - CLEANED UP */}
//         <Box sx={{ mb: 2 }}>
//           <Button
//             fullWidth
//             variant="contained"
//             color="error"
//             size="large"
//             startIcon={<MissileIcon />}
//             onClick={() => {
//               console.log(`Firing ${selectedWeapon}:`, {
//                 missionState,
//                 lockStatus: targeting.lockStatus,
//                 ammo: ammoCount[selectedWeapon],
//                 targetingJammed
//               });
              
//               // ADDED: Handle firing response and show errors
//               const result = fireMissile();
//               if (result && !result.success) {
//                 setFiringError(result.error);
//                 setTimeout(() => setFiringError(null), 5000); // Clear error after 5 seconds
//               } else {
//                 setFiringError(null);
//               }
//             }}
//             disabled={
//               missionState !== 'attacking' ||
//               targeting.lockStatus !== 'locked' ||
//               ammoCount[selectedWeapon] <= 0 ||
//               targetingJammed ||
//               (firingCondition && !firingCondition.canFire) // ADDED: Disable based on weapon conditions
//             }
//             sx={{
//               fontSize: '1.2rem',
//               fontWeight: 'bold',
//               py: 2,
//               bgcolor: (missionState === 'attacking' && targeting.lockStatus === 'locked' && ammoCount[selectedWeapon] > 0 && !targetingJammed && (!firingCondition || firingCondition.canFire)) ? 'error.main' : 'grey.600',
//               color: (missionState === 'attacking' && targeting.lockStatus === 'locked' && ammoCount[selectedWeapon] > 0 && !targetingJammed && (!firingCondition || firingCondition.canFire)) ? 'white' : 'grey.400',
//               '&:hover': {
//                 bgcolor: (missionState === 'attacking' && targeting.lockStatus === 'locked' && ammoCount[selectedWeapon] > 0 && !targetingJammed && (!firingCondition || firingCondition.canFire)) ? 'error.dark' : 'grey.600'
//               }
//             }}
//           >
//             🚀 FIRE {selectedWeapon.toUpperCase()}
//           </Button>
          
//           {/* ADDED: Weapon-specific disclaimer */}
//           {firingCondition && !firingCondition.canFire && (
//             <Alert severity="warning" sx={{ mt: 1 }}>
//               <Typography variant="body2">
//                 <strong>{selectedWeapon === 'bomb' ? '💣 Bomb Deployment:' : '🚀 Missile Engagement:'}</strong>
//               </Typography>
//               <Typography variant="body2">
//                 {firingCondition.error}
//               </Typography>
//               <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
//                 Required distance: ≤{firingCondition.requiredDistance}m | Current: {firingCondition.currentDistance}m
//               </Typography>
//             </Alert>
//           )}
          
//           {/* ADDED: Firing error display */}
//           {firingError && (
//             <Alert severity="error" sx={{ mt: 1 }}>
//               <Typography variant="body2">
//                 {firingError}
//               </Typography>
//             </Alert>
//           )}
//         </Box>
        
//         {/* CLEAR FIRING STATUS */}
//         <Paper sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid #555' }}>
//           <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
//             🎯 FIRING STATUS:
//           </Typography>
//           <Stack spacing={0.5}>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//               <Typography variant="caption" sx={{ color: '#ccc' }}>Mission State:</Typography>
//               <Chip 
//                 label={missionState.toUpperCase()} 
//                 size="small" 
//                 color={missionState === 'attacking' ? 'success' : 'default'}
//               />
//             </Box>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//               <Typography variant="caption" sx={{ color: '#ccc' }}>Target Lock:</Typography>
//               <Chip 
//                 label={targeting.lockStatus.toUpperCase()} 
//                 size="small" 
//                 color={targeting.lockStatus === 'locked' ? 'success' : targeting.lockStatus === 'locking' ? 'warning' : 'default'}
//               />
//             </Box>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//               <Typography variant="caption" sx={{ color: '#ccc' }}>Ammo ({selectedWeapon}):</Typography>
//               <Chip 
//                 label={`${ammoCount[selectedWeapon]} remaining`} 
//                 size="small" 
//                 color={ammoCount[selectedWeapon] > 0 ? 'success' : 'error'}
//               />
//             </Box>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//               <Typography variant="caption" sx={{ color: '#ccc' }}>Systems:</Typography>
//               <Chip 
//                 label={targetingJammed ? 'JAMMED' : 'ONLINE'} 
//                 size="small" 
//                 color={targetingJammed ? 'error' : 'success'}
//               />
//             </Box>
//           </Stack>
//         </Paper>
//       </Paper>

//       {/* Movement Controls - NEW SECTION */}
//       <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #444' }}>
//         <Typography variant="h6" gutterBottom sx={{ color: '#2196f3' }}>
//           🎮 UAV Movement Controls
//         </Typography>
        
//         <Typography variant="body2" sx={{ color: 'white', mb: 2 }}>
//           Move UAV closer to targets to engage. Current distance: {
//             targeting.lockedTarget && availableTargets.find(t => t.id === targeting.lockedTarget) ? 
//               Math.sqrt(
//                 Math.pow(position[0] - availableTargets.find(t => t.id === targeting.lockedTarget).position[0], 2) +
//                 Math.pow(position[2] - availableTargets.find(t => t.id === targeting.lockedTarget).position[2], 2)
//               ).toFixed(1) + 'm' : 
//               'No target selected'
//           }
//         </Typography>
        
//         <Grid container spacing={2}>
//           <Grid item xs={12}>
//             <Button 
//               fullWidth
//               variant="contained" 
//               color="primary"
//               startIcon={<HomeIcon />}
//               onClick={() => {
//                 useUAVStore.getState().setTargetPosition([-45, 25, -40]);
//               }}
//             >
//               Return to Base
//             </Button>
//           </Grid>
//         </Grid>
//       </Paper>
//     </Paper>
//   );
// };

// export default AttackDashboard;




import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Badge, Chip, Stack, LinearProgress, Divider, Alert, TextField, Grid, Slider } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import MissileIcon from '@mui/icons-material/RocketLaunch';
import HomeIcon from '@mui/icons-material/Home';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import BlockIcon from '@mui/icons-material/Block';
import { useUAVStore } from '../../store/uavStore';
import { useAttackDroneStore } from '../../store/attackDroneStore';
import { useTargetStore } from '../../store/targetStore';
import { useMissionStore } from '../../store/missionStore';
import DamageAssessment from './DamageAssessment';
import LockOnProgress from './LockOnProgress'

// Constants for defense system
const RADAR_RADIUS = 50; // Detection range
const MIN_SAFE_ALTITUDE = 20; // Below this height, UAV is undetectable

const AttackDashboard = () => {
  // FIX: Add 'targets' to the destructuring assignment to make it available in the component.
  const { position, setPosition, setTargetPosition, targets } = useUAVStore();
  const { 
    missionState, beginMission, returnToBase, fireMissile, 
    targeting, beginTargetLock, targetingJammed, selectedWeapon, 
    ammoCount, setDroneDamage, droneHealth, communicationsJammed,
    attackPosition, homeBase // FIX: Add missing variables
  } = useAttackDroneStore();

  // ADDED: Get mission time tracking from mission store
  const { 
    missionStatus: currentMissionStatus, // FIXED: Rename to avoid conflict with missionState
    missionTimeRemaining, 
    missionDuration,
    missionType 
  } = useMissionStore();

  // State for coordinate input fields
  const [coordinates, setCoordinates] = useState({ x: '', y: '', z: '' });
  // State for defense system detection
  const [isDefenseSystemDetected, setIsDefenseSystemDetected] = useState(false);
  const [altitudeSlider, setAltitudeSlider] = useState(position ? position[1] : 35);
  // ADDED: State for firing error messages
  const [firingError, setFiringError] = useState(null);

  // FIXED: Update altitude slider when position changes
  useEffect(() => {
    if (position && position[1] !== altitudeSlider) {
      setAltitudeSlider(position[1]);
    }
  }, [position]);

  // ADDED: Format time function for mission timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if UAV is in defense system range and above minimum altitude
  useEffect(() => {
    if (!position) return;

    // Get UAV position and calculate if it's within defense range
    const warehousePos = [40, 20, 35]; // Warehouse position where defense system is

    const distance = Math.sqrt(
      Math.pow(warehousePos[0] - position[0], 2) +
      Math.pow(warehousePos[2] - position[2], 2) // Only check X-Z plane distance
    );

    const uavAltitude = position[1];

    // Detect if UAV is within range and above minimum altitude
    const detected = distance < RADAR_RADIUS && uavAltitude > MIN_SAFE_ALTITUDE;
    setIsDefenseSystemDetected(detected);

  }, [position]);

  // Handle moving to coordinates then preparing to fire
  const handleCoordinateSubmit = () => {
    // Parse and validate input values
    const rawX = parseFloat(coordinates.x);
    const rawY = parseFloat(coordinates.y);
    const rawZ = parseFloat(coordinates.z);

    // Check if they are valid numbers
    if (isNaN(rawX) || isNaN(rawY) || isNaN(rawZ)) {
      console.warn("Invalid coordinate values. Please enter numbers.");
      return;
    }

    // Apply limits for coordinates
    const x = Math.min(Math.max(rawX, -50), 50);
    const y = Math.min(Math.max(rawY, 10), 100);
    const z = Math.min(Math.max(rawZ, -50), 50);

    // Update the input fields with validated values
    setCoordinates({
      x: x.toString(),
      y: y.toString(),
      z: z.toString()
    });

    // Set the target position and initiate movement
    useAttackDroneStore.getState().moveToPosition([x, y, z]);
    console.log("UAV moving to position:", [x, y, z]);
  };

  // Handle target selection
  const handleSelectTarget = (targetId) => {
    if (missionState !== 'attacking' || targetingJammed) {
      console.log("Cannot select target - UAV must be in attack position and systems must be online.");
      return;
    }

    // Begin target lock process from the store
    console.log("Attempting to lock on target:", targetId);
    beginTargetLock(targetId);
  };

  // Calculate distance between UAV and target
  const calculateDistance = (targetPosition) => {
    if (!targetPosition || !position || targetPosition.length < 3 || position.length < 3) {
      return 0;
    }
    return Math.sqrt(
      Math.pow(targetPosition[0] - position[0], 2) +
      Math.pow(targetPosition[1] - position[1], 2) +
      Math.pow(targetPosition[2] - position[2], 2)
    ).toFixed(2);
  };
  
  // Handle coordinate input changes
  const handleCoordinateChange = (axis, value) => {
    // Just update the state with whatever the user types - no immediate validation
    setCoordinates({
      ...coordinates,
      [axis]: value
    });
  };
  
  // Then in the same file, add this function for validating on blur
  const handleCoordinateBlur = (axis) => {
    const value = coordinates[axis];
    
    // Skip validation for empty values
    if (value === '' || value === '-') return;
    
    const numValue = parseFloat(value);
    
    // Skip validation if not a number
    if (isNaN(numValue)) return;
    
    let validatedValue;
    
    // Apply limits based on axis
    switch(axis) {
      case 'x':
      case 'z':
        validatedValue = Math.min(Math.max(numValue, -50), 50);
        break;
      case 'y':
        validatedValue = Math.min(Math.max(numValue, 10), 100);
        break;
      default:
        validatedValue = numValue;
    }
    
    // Only update if the validated value is different from the input
    if (validatedValue !== numValue) {
      setCoordinates(prev => ({
        ...prev,
        [axis]: validatedValue.toString()
      }));
    }
  };
  
  // Get mission status information
  const getMissionStatusInfo = () => {
    switch(missionState) {
      case 'moving':
        return {
          label: 'MOVING TO ATTACK POSITION',
          color: '#ff9800',
          icon: <FlightTakeoffIcon />,
          description: 'Flying to optimal attack position'
        };
      case 'attacking':
        return {
          label: 'ATTACK POSITION REACHED',
          color: '#f44336',
          icon: <MissileIcon />,
          description: 'Ready to engage target'
        };
      case 'returning':
        return {
          label: 'RETURNING TO BASE',
          color: '#2196f3',
          icon: <FlightLandIcon />,
          description: 'Mission complete, returning home'
        };
      case 'crashed':
        return {
          label: 'DRONE CRASHED',
          color: '#d32f2f', // deep red
          icon: <WarningIcon />,
          description: 'UAV destroyed by defense systems'
        };
      default:
        return {
          label: 'STANDBY',
          color: '#757575',
          icon: <HomeIcon />,
          description: 'Ready for mission assignment'
        };
    }
  };
  
  const missionStatus = getMissionStatusInfo();
  
  // Handle anti-drone defensive system attack on UAV
  const handleAntiDroneAttack = () => {
    console.log('[AttackDashboard] Defense button pressed!');
    console.log('[AttackDashboard] isDefenseSystemDetected:', isDefenseSystemDetected);
    
    // Only works if UAV is detected (above MIN_SAFE_ALTITUDE and in range)
    if (isDefenseSystemDetected) {
      console.log("[AttackDashboard] Defense system activated - UAV shot down!");
      
      // Check current UAV state before crashing
      const currentUAVState = useUAVStore.getState();
      console.log('[AttackDashboard] Current UAV state before crash:', {
        position: currentUAVState.position,
        isCrashed: currentUAVState.isCrashed,
        droneType: currentUAVState.droneType
      });
      
      // FIXED: Set the correct crash state that AttackUAV component uses
      // AttackUAV checks for missionState === 'crashed', not isCrashed
      const attackDroneStore = useAttackDroneStore.getState();
      
      // Set mission state to crashed (this is what AttackUAV component checks)
      attackDroneStore.missionState = 'crashed';
      
      // Also set UAV store crash state for consistency
      useUAVStore.getState().setCrashed(true, 'Shot down by anti-drone defense system');
      
      // Check states after crashing
      console.log('[AttackDashboard] States after crash:', {
        uavStore_isCrashed: useUAVStore.getState().isCrashed,
        attackDroneStore_missionState: useAttackDroneStore.getState().missionState
      });
      
      // Set drone damage for visual effects
      useAttackDroneStore.getState().setDroneDamage({
        type: 'defense_system',
        damage: 100,
        duration: 5000
      });
      
      console.log("[AttackDashboard] UAV crashed successfully!");
    } else {
      console.log("[AttackDashboard] Cannot activate defense system - UAV not detected or below safe altitude");
    }
  };
  
  // Get detected targets from the target store
  const detectedTargets = useTargetStore(state => state.detectedTargets || []);
  
  // Filter targets for display
  const availableTargets = targets.filter(target => 
    // Check if this target is in the detected targets list
    detectedTargets.some(detected => 
      detected.id === target.id || 
      (Math.abs(detected.position[0] - target.position[0]) < 2 && 
       Math.abs(detected.position[2] - target.position[2]) < 2)
    )
  );
  
  // FIXED: Update altitude change handlers to properly manage slider state
  const handleAltitudeChange = (event, newValue) => {
    // Update slider state immediately for smooth sliding
    setAltitudeSlider(newValue);
    // Set the new position directly
    setPosition([position[0], newValue, position[2]]);
    // CRITICAL: Clear the target position to prevent UAVController from overriding this manual change.
    setTargetPosition(null);
  };

  const handleAltitudeChangeCommitted = (event, newValue) => {
    // Ensure final position is set when slider interaction is complete
    setPosition([position[0], newValue, position[2]]);
    setAltitudeSlider(newValue);
  };
  
  const targetingData = {
    selectedTarget: targeting?.lockedTarget 
      ? targets.find(t => t.id === targeting.lockedTarget)
      : null,
    lockStatus: targeting?.lockStatus || 'inactive',
    lockProgress: targeting?.lockTimer / (targeting?.maxLockTime || 1)
  };

  // FIXED: Function to check weapon-specific firing conditions (matches store logic)
  const checkFiringConditions = () => {
    if (!targeting.lockedTarget || !availableTargets.length) return null;
    
    const target = availableTargets.find(t => t.id === targeting.lockedTarget);
    if (!target) return null;
    
    const distanceToTarget = Math.sqrt(
      Math.pow(position[0] - target.position[0], 2) +
      Math.pow(position[2] - target.position[2], 2)
    );
    
    // FIXED: Weapon-specific distance and positioning requirements
    if (selectedWeapon === 'bomb') {
      // Bombs require UAV to be directly above target (within 10 meters horizontally)
      if (distanceToTarget > 10) {
        return {
          canFire: false,
          error: "Position UAV directly above target to drop bombs",
          requiredDistance: 10,
          currentDistance: distanceToTarget.toFixed(1)
        };
      }
      
      // Check if UAV is at appropriate altitude above target
      const altitudeDifference = Math.abs(position[1] - target.position[1]);
      if (altitudeDifference < 15) {
        return {
          canFire: false,
          error: "Gain altitude above target for safe bomb deployment",
          requiredAltitude: "15m above target",
          currentAltitude: altitudeDifference.toFixed(1) + "m"
        };
      }
    } else if (selectedWeapon === 'missile') {
      // FIXED: Missiles require UAV to be within 20 meters for engagement
      if (distanceToTarget > 20) {
        return {
          canFire: false,
          error: "Move within 20 meters of target for missile engagement",
          requiredDistance: 20,
          currentDistance: distanceToTarget.toFixed(1)
        };
      }
    }
    
    return { canFire: true };
  };

  const firingCondition = checkFiringConditions();

  return (
    <Paper sx={{ p: 2, m: 2, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Attack Drone Command
      </Typography>
      
      {/* ADDED: Mission Time Bar - Similar to CommandDashboard */}
      {(currentMissionStatus === 'active' || missionTimeRemaining > 0) && (
        <Paper 
          elevation={2} 
          sx={{ 
            mb: 2, 
            p: 2, 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            borderRadius: 2,
            border: '1px solid rgba(255,69,0,0.3)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
                <Box component="span" sx={{ color: '#ff4500', mr: 1 }}>⚡</Box>
                {missionType === 'surveillance' ? 'Surveillance & Attack' : 'Attack Mission'}
              </Typography>
            </Box>
            <Chip 
              label={currentMissionStatus === 'active' ? 'ACTIVE' : 'STANDBY'} 
              size="small" 
              sx={{ 
                bgcolor: currentMissionStatus === 'active' ? 'error.main' : 'warning.main',
                color: 'white',
                fontWeight: 'bold'
              }} 
            />
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: '#ccc' }}>Mission Time</Typography>
              <Typography variant="body2" sx={{ color: missionTimeRemaining < 20 ? '#ff3d00' : '#ff4500', fontWeight: 'bold' }}>
                {formatTime(missionTimeRemaining)} remaining
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={missionDuration > 0 ? (missionTimeRemaining / missionDuration) * 100 : 0}
              sx={{ 
                height: 8, 
                borderRadius: 1,
                backgroundColor: 'rgba(0,0,0,0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: missionTimeRemaining < 20 ? '#ff3d00' : '#ff4500'
                }
              }} 
            />
          </Box>
        </Paper>
      )}
      
      {/* Add Coordinate Controls */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          UAV Position Controls
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              label="X"
              type="number"
              value={coordinates.x}
              onChange={(e) => handleCoordinateChange('x', e.target.value)}
              onBlur={() => handleCoordinateBlur('x')}
              size="small"
              fullWidth
              placeholder="X (-50 to 50)"
              // Remove the inputProps that restrict input
              // inputProps={{ min: -50, max: 50 }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Y"
              type="number"
              value={coordinates.y}
              onChange={(e) => handleCoordinateChange('y', e.target.value)}
              onBlur={() => handleCoordinateBlur('y')}
              size="small"
              fullWidth
              placeholder="Y (10 to 100)"
              // Remove the inputProps that restrict input
              // inputProps={{ min: 10, max: 100 }}
              helperText={parseFloat(coordinates.y) < MIN_SAFE_ALTITUDE ? "Stealth" : ""}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Z"
              type="number"
              value={coordinates.z}
              onChange={(e) => handleCoordinateChange('z', e.target.value)}
              onBlur={() => handleCoordinateBlur('z')}
              size="small"
              fullWidth
              placeholder="Z (-50 to 50)"
              // Remove the inputProps that restrict input
              // inputProps={{ min: -50, max: 50 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              onClick={handleCoordinateSubmit} 
              fullWidth
              disabled={missionState !== 'idle'}
            >
              Set Position
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Current: {position ? `[${position.map(n => Math.floor(n)).join(', ')}]` : 'Unknown'}
              {position && position[1] < MIN_SAFE_ALTITUDE && (
                <Chip
                  label="STEALTH MODE"
                  size="small"
                  color="success"
                  sx={{ ml: 1, height: 20 }}
                />
              )}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      
      {/* Mission Status */}
      <Box sx={{ mb: 3, p: 1, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ mr: 1, color: missionStatus.color }}>{missionStatus.icon}</Box>
          <Typography variant="subtitle1" color={missionStatus.color} fontWeight="bold">
            {missionStatus.label}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {missionStatus.description}
        </Typography>
        
        {/* Position information */}
        <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
          <div>Current: {position ? `[${position.map(n => Math.floor(n)).join(', ')}]` : 'Unknown'}</div>
          {missionState === 'moving' && attackPosition && (
            <div>Target: [{attackPosition.map(n => Math.floor(n)).join(', ')}]</div>
          )}
          {missionState === 'returning' && homeBase && (
            <div>Base: [{homeBase.map(n => Math.floor(n)).join(', ')}]</div>
          )}
        </Box>
        
        {/* Return to base button */}
        {(missionState === 'attacking' || missionState === 'moving') && (
          <Button 
            variant="outlined" 
            size="small"
            startIcon={<HomeIcon />}
            onClick={returnToBase}
            sx={{ mt: 1 }}
          >
            Return To Base
          </Button>
        )}
      </Box>

      {/* Weapons System */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Weapons System
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button 
            variant="contained"
            color={selectedWeapon === 'missile' ? 'primary' : 'inherit'}
            onClick={() => selectWeapon('missile')}
            disabled={missionState !== 'idle' && missionState !== 'attacking'}
            sx={{ 
              bgcolor: selectedWeapon === 'missile' ? '#90caf9' : 'transparent',
              '&:hover': { bgcolor: selectedWeapon === 'missile' ? '#64b5f6' : '#424242' }
            }}
          >
            MISSILES
            <Badge 
              badgeContent={ammoCount.missile} 
              color="error"
              sx={{ ml: 1 }}
            />
          </Button>
          <Button 
            variant="contained"
            color={selectedWeapon === 'bomb' ? 'primary' : 'inherit'}
            onClick={() => selectWeapon('bomb')}
            disabled={missionState !== 'idle' && missionState !== 'attacking'}
            sx={{ 
              bgcolor: selectedWeapon === 'bomb' ? '#90caf9' : 'transparent',
              '&:hover': { bgcolor: selectedWeapon === 'bomb' ? '#64b5f6' : '#424242' }
            }}
          >
            BOMBS
            <Badge 
              badgeContent={ammoCount.bomb} 
              color="error"
              sx={{ ml: 1 }}
            />
          </Button>
        </Stack>
      </Box>
      
      {/* Target Acquisition */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Target Acquisition
        </Typography>
        
        {targeting.lockStatus !== 'inactive' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Lock Status:</Typography>
            <LockOnProgress 
              status={targeting.lockStatus} 
              progress={targeting.lockTimer / targeting.maxLockTime} 
            />
          </Box>
        )}
        
        {/* DUPLICATE FIRE BUTTON REMOVED - Using the improved version in Weapon Systems section below */}
        
        {/* Target list */}
        <Typography variant="subtitle2" gutterBottom>
          Available Targets:
        </Typography>
        
        {Array.isArray(availableTargets) && availableTargets.length > 0 ? (
          availableTargets.map((target) => (
            <div 
              key={target.id} 
              style={{ 
                padding: '8px',
                marginBottom: '8px',
                backgroundColor: targeting.lockedTarget === target.id ? '#ffebee' : '#f5f5f5',
                border: targeting.lockedTarget === target.id ? '1px solid #f44336' : '1px solid #ccc',
                borderRadius: '4px',
                cursor: missionState === 'attacking' ? 'pointer' : 'default',
                opacity: missionState === 'attacking' ? 1 : 0.7
              }}
              onClick={() => missionState === 'attacking' && handleSelectTarget(target.id)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'black' }}>
                  {target.type.charAt(0).toUpperCase() + target.type.slice(1)}
                </Typography>
                <Chip
                  label={targeting.lockedTarget === target.id ? '🔒 LOCKED' : 
                    missionState !== 'attacking' ? '🎯 SWITCH TO ATTACK' : '🎯 SELECT'}
                  size="small"
                  color={targeting.lockedTarget === target.id ? 'success' : 
                    missionState !== 'attacking' ? 'warning' : 'primary'}
                  variant={targeting.lockedTarget === target.id ? 'filled' : 'outlined'}
                  disabled={targetingJammed}
                  icon={<GpsFixedIcon fontSize="small" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('SELECT button clicked:', {
                      targetId: target.id,
                      missionState,
                      targetingJammed,
                      currentLock: targeting.lockedTarget,
                      distance: calculateDistance(target.position)
                    });
                    
                    if (targetingJammed) {
                      console.log('Cannot select - targeting jammed');
                      return;
                    }
                    
                    // If not in attacking mode, switch to attacking mode first
                    if (missionState !== 'attacking') {
                      console.log('Switching to attacking mode...');
                      useAttackDroneStore.setState({ missionState: 'attacking' });
                      // Small delay to ensure state update, then select target
                      setTimeout(() => {
                        handleSelectTarget(target.id);
                      }, 100);
                    } else {
                      handleSelectTarget(target.id);
                    }
                  }}
                  sx={{
                    cursor: (missionState === 'attacking' && !targetingJammed) ? 'pointer' : 'not-allowed',
                    '&:hover': {
                      backgroundColor: targeting.lockedTarget === target.id ? 'success.dark' : 'primary.light'
                    },
                    ...(targeting.lockedTarget !== target.id && {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '.MuiChip-icon': {
                        color: 'primary.main'
                      }
                    })
                  }}
                />
              </Box>
              <Typography variant="body2" color='black'>
                Distance: {calculateDistance(target.position)} m
              </Typography>
            </div>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No targets detected in range.
          </Typography>
        )}
      </Box>

      {/* Damage Assessment */}
      <DamageAssessment />

      {/* Defense System Warning */}
      {isDefenseSystemDetected && (
        <Box sx={{
          mb: 2,
          p: 1,
          bgcolor: 'rgba(255,0,0,0.15)',
          borderRadius: 1,
          border: '1px solid #f44336'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WarningIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" color="error" fontWeight="bold">
              DEFENSE SYSTEM DETECTED
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Anti-aircraft defenses operational. Fly below {MIN_SAFE_ALTITUDE}m altitude to avoid detection.
          </Typography>
          {droneHealth < 100 && (
            <LinearProgress
              variant="determinate"
              value={droneHealth}
              sx={{
                mt: 1,
                height: 10,
                borderRadius: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: droneHealth > 70 ? '#4caf50' :
                    droneHealth > 30 ? '#ff9800' : '#f44336'
                }
              }}
            />
          )}

          {/* Anti-Drone Attack Button */}
          <Button
            variant="contained"
            color="error"
            fullWidth
            sx={{ mt: 1 }}
            onClick={handleAntiDroneAttack}
          >
            ACTIVATE DEFENSE SYSTEM
          </Button>
        </Box>
      )}

      {/* System Malfunction Warnings */}
      {communicationsJammed && (
        <Alert
          severity="error"
          icon={<BlockIcon />}
          sx={{ mb: 2 }}
        >
          COMMUNICATIONS JAMMED - Control systems impaired
        </Alert>
      )}

      {targetingJammed && (
        <Alert
          severity="error"
          icon={<BlockIcon />}
          sx={{ mb: 2 }}
        >
          TARGETING SYSTEMS JAMMED - Weapons systems offline
        </Alert>
      )}

      {/* Altitude Control Panel - NEW SECTION */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #444' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#ff9800' }}>
          ⛰️ Attack Altitude Control
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'white' }} gutterBottom>
          Current Altitude: {Math.floor(position[1])}m
        </Typography>
        
        <Box sx={{ px: 1, py: 2 }}>
          <Slider
            value={altitudeSlider}
            onChange={handleAltitudeChange}
            onChangeCommitted={handleAltitudeChangeCommitted}
            min={10}
            max={100}
            step={1}
            marks={[
              { value: 10, label: '10m' },
              { value: 20, label: 'th' },
              { value: 50, label: '50m' },
              { value: 100, label: '100m' }
            ]}
            valueLabelDisplay="on"
            valueLabelFormat={(value) => `${value}m`}
            sx={{
              color: droneHealth < 50 ? 'error.main' : '#ff9800',
              '& .MuiSlider-thumb': {
                backgroundColor: droneHealth < 50 ? 'error.main' : '#ff9800'
              },
              '& .MuiSlider-track': {
                backgroundColor: droneHealth < 50 ? 'error.main' : '#ff9800'
              },
              '& .MuiSlider-markLabel': {
                color: '#ccc',
                fontSize: '0.7rem',
                whiteSpace: 'nowrap'
              }
            }}
          />
        </Box>
        
        <Typography variant="caption" display="block" sx={{ mt: 1, color: '#aaa' }}>
          Higher altitude (35-50m) reduces detection by defenses but decreases weapon accuracy
        </Typography>
        <Typography variant="caption" display="block" sx={{ color: '#aaa' }}>
          Lower altitude (15-25m) increases weapon accuracy but increases detection risk
        </Typography>
      </Paper>

      {/* Weapon System Controls - NEW SECTION */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #444' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#f44336' }}>
          🚀 Weapon Systems
        </Typography>
        
        {/* Weapon Selection */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>Selected Weapon:</Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={selectedWeapon === 'missile' ? 'contained' : 'outlined'}
                color={selectedWeapon === 'missile' ? 'error' : 'inherit'}
                size="small"
                onClick={() => useAttackDroneStore.getState().setWeaponConfig({ selectedWeapon: 'missile' })}
                disabled={ammoCount.missile <= 0}
              >
                Missile ({ammoCount.missile})
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={selectedWeapon === 'bomb' ? 'contained' : 'outlined'}
                color={selectedWeapon === 'bomb' ? 'error' : 'inherit'}
                size="small"
                onClick={() => useAttackDroneStore.getState().setWeaponConfig({ selectedWeapon: 'bomb' })}
                disabled={ammoCount.bomb <= 0}
              >
                Bomb ({ammoCount.bomb})
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Target Lock Status */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>Target Lock:</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={targeting.lockStatus === 'locked' ? 'LOCKED' : targeting.lockStatus === 'locking' ? 'LOCKING...' : 'NO LOCK'}
              color={targeting.lockStatus === 'locked' ? 'success' : targeting.lockStatus === 'locking' ? 'warning' : 'default'}
              size="small"
            />
            {targeting.lockStatus === 'locking' && (
              <LinearProgress
                variant="determinate"
                value={(targeting.lockTimer / 3) * 100}
                sx={{ flexGrow: 1, height: 6, borderRadius: 1 }}
              />
            )}
          </Box>
        </Box>

        {/* SINGLE FIRE CONTROL - CLEANED UP */}
        <Box sx={{ mb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            size="large"
            startIcon={<MissileIcon />}
            onClick={() => {
              console.log(`Firing ${selectedWeapon}:`, {
                missionState,
                lockStatus: targeting.lockStatus,
                ammo: ammoCount[selectedWeapon],
                targetingJammed
              });
              
              // ADDED: Handle firing response and show errors
              const result = fireMissile();
              if (result && !result.success) {
                setFiringError(result.error);
                setTimeout(() => setFiringError(null), 5000); // Clear error after 5 seconds
              } else {
                setFiringError(null);
              }
            }}
            disabled={
              missionState !== 'attacking' ||
              targeting.lockStatus !== 'locked' ||
              ammoCount[selectedWeapon] <= 0 ||
              targetingJammed ||
              (firingCondition && !firingCondition.canFire) // ADDED: Disable based on weapon conditions
            }
            sx={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              py: 2,
              bgcolor: (missionState === 'attacking' && targeting.lockStatus === 'locked' && ammoCount[selectedWeapon] > 0 && !targetingJammed && (!firingCondition || firingCondition.canFire)) ? 'error.main' : 'grey.600',
              color: (missionState === 'attacking' && targeting.lockStatus === 'locked' && ammoCount[selectedWeapon] > 0 && !targetingJammed && (!firingCondition || firingCondition.canFire)) ? 'white' : 'grey.400',
              '&:hover': {
                bgcolor: (missionState === 'attacking' && targeting.lockStatus === 'locked' && ammoCount[selectedWeapon] > 0 && !targetingJammed && (!firingCondition || firingCondition.canFire)) ? 'error.dark' : 'grey.600'
              }
            }}
          >
            🚀 FIRE {selectedWeapon.toUpperCase()}
          </Button>
          
          {/* ADDED: Weapon-specific disclaimer */}
          {firingCondition && !firingCondition.canFire && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>{selectedWeapon === 'bomb' ? '💣 Bomb Deployment:' : '🚀 Missile Engagement:'}</strong>
              </Typography>
              <Typography variant="body2">
                {firingCondition.error}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                Required distance: ≤{firingCondition.requiredDistance}m | Current: {firingCondition.currentDistance}m
              </Typography>
            </Alert>
          )}
          
          {/* ADDED: Firing error display */}
          {firingError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              <Typography variant="body2">
                {firingError}
              </Typography>
            </Alert>
          )}
        </Box>
        
        {/* CLEAR FIRING STATUS */}
        <Paper sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid #555' }}>
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
            🎯 FIRING STATUS:
          </Typography>
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#ccc' }}>Mission State:</Typography>
              <Chip 
                label={missionState.toUpperCase()} 
                size="small" 
                color={missionState === 'attacking' ? 'success' : 'default'}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#ccc' }}>Target Lock:</Typography>
              <Chip 
                label={targeting.lockStatus.toUpperCase()} 
                size="small" 
                color={targeting.lockStatus === 'locked' ? 'success' : targeting.lockStatus === 'locking' ? 'warning' : 'default'}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#ccc' }}>Ammo ({selectedWeapon}):</Typography>
              <Chip 
                label={`${ammoCount[selectedWeapon]} remaining`} 
                size="small" 
                color={ammoCount[selectedWeapon] > 0 ? 'success' : 'error'}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#ccc' }}>Systems:</Typography>
              <Chip 
                label={targetingJammed ? 'JAMMED' : 'ONLINE'} 
                size="small" 
                color={targetingJammed ? 'error' : 'success'}
              />
            </Box>
          </Stack>
        </Paper>
      </Paper>

      {/* Movement Controls - NEW SECTION */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #444' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#2196f3' }}>
          🎮 UAV Movement Controls
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'white', mb: 2 }}>
          Move UAV closer to targets to engage. Current distance: {
            targeting.lockedTarget && availableTargets.find(t => t.id === targeting.lockedTarget) ? 
              Math.sqrt(
                Math.pow(position[0] - availableTargets.find(t => t.id === targeting.lockedTarget).position[0], 2) +
                Math.pow(position[2] - availableTargets.find(t => t.id === targeting.lockedTarget).position[2], 2)
              ).toFixed(1) + 'm' : 
              'No target selected'
          }
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button 
              fullWidth
              variant="contained" 
              color="primary"
              startIcon={<HomeIcon />}
              onClick={() => {
                useUAVStore.getState().setTargetPosition([-45, 25, -40]);
              }}
            >
              Return to Base
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Paper>
  );
};

export default AttackDashboard;