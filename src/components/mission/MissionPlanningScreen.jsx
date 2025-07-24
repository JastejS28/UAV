import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Slider,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Switch,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Visibility as SurveillanceIcon,
  RocketLaunch as AttackIcon,
  Schedule as TimeIcon,
  Inventory as PayloadIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useMissionStore } from '../../store/missionStore';
import { useAttackDroneStore } from '../../store/attackDroneStore';

const MissionPlanningScreen = () => {
  const { startMission, setMissionMaxTime } = useMissionStore();
  
  // Use the existing state structure but adapt it to the new UI
  const [missionParameters, setMissionParameters] = useState({
    duration: 120,
    difficulty: 'medium',
    enableAdvancedFeatures: false,
    missionType: 'surveillance' // Default mission type
  });

  // Function to validate mission parameters
  const isMissionValid = () => {
    // Simple validation - ensure mission duration is between 30 and 300 seconds
    return missionParameters.duration >= 30 && missionParameters.duration <= 300;
  };

  const handleStartMission = () => {
    // Set the mission time based on selected duration
    setMissionMaxTime(missionParameters.duration);
    
    // If attack mode, set weapon configuration
    if (missionParameters.missionType === 'surveillance-attack') {
      const attackStore = useAttackDroneStore.getState();
      attackStore.setWeaponConfig({
        selectedWeapon: weaponSelection.selectedWeapon,
        missileCount: weaponSelection.missileCount,
        bombCount: weaponSelection.bombCount
      });
    }
    
    // Start the mission
    startMission();
  };

  // Handler for mission type changes
  const handleMissionTypeChange = (event) => {
    setMissionParameters(prev => ({
      ...prev,
      missionType: event.target.value
    }));
  };

  // Handler for duration changes
  const handleDurationChange = (event, newValue) => {
    setMissionParameters(prev => ({
      ...prev,
      duration: newValue
    }));
  };

  const handleDifficultyChange = (difficulty) => {
    setMissionParameters(prev => ({
      ...prev,
      difficulty
    }));
  };

  const handleFeatureToggle = (event) => {
    setMissionParameters(prev => ({
      ...prev,
      enableAdvancedFeatures: event.target.checked
    }));
  };

  // Mock payload state for UI
  const [selectedPayload, setSelectedPayload] = useState({
    bombs: 2,
    missiles: 2
  });

  const handlePayloadChange = (type, delta) => {
    setSelectedPayload(prev => ({
      ...prev,
      [type]: Math.max(0, Math.min(6, prev[type] + delta))
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMissionDescription = () => {
    switch (missionParameters.missionType) {
      case 'surveillance':
        return 'Fly over the terrain and click on targets to move your UAV to them. When your UAV is above a target, it will automatically hover for surveillance.';
      case 'surveillance-attack':
        return 'Discover and hover above targets for surveillance by clicking on them, then engage and destroy them. Mission requires both stealth and precision.';
      default:
        return 'Select a mission type to see objectives.';
    }
  };

  // Mock objectives for UI
  const objectives = {
    requiredSurveillanceTime: 30,
    requiredTargetsDestroyed: 3,
    maxAllowedDetections: 2
  };

  // Add weapon selection state
  const [weaponSelection, setWeaponSelection] = useState({
    selectedWeapon: 'missile',
    missileCount: 6,
    bombCount: 3
  });

  const handleWeaponChange = (event) => {
    setWeaponSelection({
      ...weaponSelection,
      selectedWeapon: event.target.value
    });
  };

  const handleCountChange = (type) => (event, newValue) => {
    setWeaponSelection({
      ...weaponSelection,
      [`${type}Count`]: newValue
    });
  };

  return (
    <>
      {/* Add a full-screen overlay */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
      }} />
      
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}>
        <Box sx={{
          maxWidth: 900,
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          color: 'white',
        }}>
          <Typography variant="h3" component="h1" sx={{ 
            mb: 2, 
            color: '#00a0ff',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            Mission Planning & Setup
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: '#ccc' }}>
            Configure your UAV mission - click on targets to move to them and hover for surveillance
          </Typography>
          
          <Grid container spacing={3}>
            {/* Mission Type Selection */}
            <Grid item xs={12} md={8}>
              <Card sx={{ bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #333', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SurveillanceIcon sx={{ mr: 1, color: '#2196F3' }} />
                    <Typography variant="h6">Mission Objective</Typography>
                  </Box>
                  
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={missionParameters.missionType}
                      onChange={handleMissionTypeChange}
                    >
                      <FormControlLabel
                        value="surveillance"
                        control={<Radio sx={{ color: '#2196F3' }} />}
                        label={
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              Surveillance Mission
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Discover targets by clicking on them and hover above them to gather intelligence
                            </Typography>
                          </Box>
                        }
                        sx={{ mb: 2, alignItems: 'flex-start' }}
                      />
                      <FormControlLabel
                        value="surveillance-attack"
                        control={<Radio sx={{ color: '#f44336' }} />}
                        label={
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              Surveillance & Attack
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Click on targets to hover for surveillance, then destroy identified targets
                            </Typography>
                          </Box>
                        }
                        sx={{ alignItems: 'flex-start' }}
                      />
                    </RadioGroup>
                  </FormControl>

                  {missionParameters.missionType && (
                    <Alert 
                      severity="info" 
                      sx={{ mt: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', border: '1px solid #2196F3' }}
                    >
                      {getMissionDescription()}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Time & Resource Management */}
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #333', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimeIcon sx={{ mr: 1, color: '#ff9800' }} />
                    <Typography variant="h6">Time Management</Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Mission Duration (seconds)
                    </Typography>
                    <Slider
                      value={missionParameters.duration}
                      onChange={handleDurationChange}
                      min={30}
                      max={300}
                      step={30}
                      marks={[
                        { value: 30, label: '30s' },
                        { value: 120, label: '2m' },
                        { value: 300, label: '5m' }
                      ]}
                      valueLabelDisplay="on"
                      valueLabelFormat={(value) => `${value}s`}
                      sx={{ color: '#ff9800' }}
                    />
                  </Box>

                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Mission Time
                    </Typography>
                    <Typography variant="h6" color="#ff9800">
                      {formatTime(missionParameters.duration)}
                    </Typography>
                    
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Time includes travel to targets, hovering for surveillance, and return to base
                    </Alert>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Mission Instructions */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #333' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📋 Mission Instructions
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Alert severity="info">
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        How to Complete Your Mission:
                      </Typography>
                      <Typography variant="body2" component="div">
                        1. <strong>Spawn UAV:</strong> Click on terrain to deploy your drone<br/>
                        2. <strong>Select Targets:</strong> Click on targets you want to investigate<br/>
                        3. <strong>Hover:</strong> UAV will automatically hover above the selected target<br/>
                        4. <strong>Repeat:</strong> Click on new targets to move to them for surveillance<br/>
                        5. <strong>Return:</strong> Mission ends when time expires or when returning to base
                      </Typography>
                    </Alert>
                    
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Time Management:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Total time includes travel, hovering, and return to base<br/>
                        • Base location: [-45, 30, -45]<br/>
                        • UAV will return to base when time is low
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Mission Summary & Start */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #333' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Mission Summary
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        <Chip
                          icon={missionParameters.missionType === 'surveillance' ? <SurveillanceIcon /> : <AttackIcon />}
                          label={missionParameters.missionType === 'surveillance' ? 'Surveillance Mission' : 'Surveillance & Attack'}
                          color="primary"
                        />
                        <Chip
                          icon={<TimeIcon />}
                          label={`${formatTime(missionParameters.duration)} total`}
                          color="secondary"
                        />
                        <Chip
                          label="Manual target selection"
                          color="success"
                        />
                      </Box>

                      <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Mission Objectives:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2">
                            • Click on targets to move UAV to them
                          </Typography>
                          <Typography variant="body2">
                            • Hover above targets to gather intelligence
                          </Typography>
                          <Typography variant="body2">
                            • Return to base when mission is complete
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'center' }}>
                        {!isMissionValid() && (
                          <Alert severity="error" icon={<WarningIcon />}>
                            Complete all mission parameters to start
                          </Alert>
                        )}
                        
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={isMissionValid() ? <StartIcon /> : <WarningIcon />}
                          onClick={handleStartMission}
                          disabled={!isMissionValid()}
                          sx={{
                            py: 2,
                            fontSize: '1.1rem',
                            bgcolor: isMissionValid() ? '#4caf50' : '#666',
                            '&:hover': {
                              bgcolor: isMissionValid() ? '#45a049' : '#666'
                            }
                          }}
                        >
                          {isMissionValid() ? 'Start Mission' : 'Configure Mission'}
                        </Button>
                        
                        {isMissionValid() && (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckIcon sx={{ color: '#4caf50', mr: 1 }} />
                            <Typography variant="body2" color="#4caf50">
                              Mission Ready
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Weapons Configuration - Attack Drone Only */}
            {missionParameters.missionType === 'surveillance-attack' && (
              <Grid item xs={12}>
                <Card sx={{ bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #333' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Weapons Configuration
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Default Weapon</InputLabel>
                          <Select
                            value={weaponSelection.selectedWeapon}
                            onChange={handleWeaponChange}
                            label="Default Weapon"
                          >
                            <MenuItem value="missile">Air-to-Ground Missiles</MenuItem>
                            <MenuItem value="bomb">Precision Bombs</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography id="missile-count" gutterBottom>
                          Missiles: {weaponSelection.missileCount}
                        </Typography>
                        <Slider
                          value={weaponSelection.missileCount}
                          onChange={handleCountChange('missile')}
                          step={1}
                          marks
                          min={0}
                          max={8}
                          valueLabelDisplay="auto"
                          aria-labelledby="missile-count"
                          sx={{ color: '#ff9800' }}
                        />
                        
                        <Typography id="bomb-count" gutterBottom>
                          Bombs: {weaponSelection.bombCount}
                        </Typography>
                        <Slider
                          value={weaponSelection.bombCount}
                          onChange={handleCountChange('bomb')}
                          step={1}
                          marks
                          min={0}
                          max={4}
                          valueLabelDisplay="auto"
                          aria-labelledby="bomb-count"
                          sx={{ color: '#ff9800' }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default MissionPlanningScreen;