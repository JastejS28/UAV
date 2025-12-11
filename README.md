UAV Simulation System

A comprehensive 3D UAV (Unmanned Aerial Vehicle) simulation built with React, Three.js, and React Three Fiber.
Supports surveillance and attack drone modes with realistic terrain interaction, target detection, anti-drone defense systems, and mission mechanics.

📋 Table of Contents

Features

Demo

Installation

Usage

Project Structure

Architecture

Components Overview

State Management

3D Models & Assets

Configuration

Contributing

License

Credits

✨ Features
Drone Types

Surveillance UAV — Recon drone for detection & monitoring

Attack UAV — Combat drone with missile & lock-on capabilities

Core Functionality

Interactive 3D environment (mountains, buildings, military assets)

Click-to-move UAV navigation

Camera modes: third-person, first-person, down-facing

Thermal vision toggle

Realistic battery management

Dynamic weather (day, night, rain)

Wind gust simulation

Mission System

Mission planning and configuration

Timed missions with automatic completion

Post-mission statistics and damage assessment

Real-time target tracking

Combat Features (Attack Drone)

Lock-on missile system and launch mechanics

Explosion and fire visual effects

Progressive target lock system

Post-strike damage evaluation

Defense Systems

Anti-drone radar detection

Automated defense projectiles and bombs

Realistic UAV damage modeling and crash mechanics

Targets

Tanks (high thermal signature)

Jeeps (light vehicles)

Warehouses (large structures)

Soldiers (personnel targets)

🎮 Demo
Surveillance Mode

Select Surveillance drone type

Configure mission (duration, targets)

Click terrain to spawn UAV

Navigate to targets by clicking them

Hover above targets to complete surveillance

Return to base before mission time expires

Attack Mode

Select Attack drone type

Deploy UAV to desired location

Use coordinate controls or click-to-move

Lock onto targets and launch missiles when lock completes

Avoid anti-drone defenses (flying below 20m reduces detection)

🚀 Installation
Prerequisites

Node.js 18+

npm or yarn

Setup
git clone https://github.com/yourusername/uav-simulation.git
cd uav-simulation

Install dependencies
npm install

Start dev server
npm run dev


Open http://localhost:5173

Build for production
npm run build

Preview production build
npm run preview

📖 Usage
Controls
Action	Control
Spawn UAV	Click on terrain
Move UAV	Click on terrain (after spawn)
Camera rotate	Click and drag on 3D view
Camera zoom	Mouse scroll wheel
Toggle thermal	Switch in dashboard
Change altitude	Altitude slider
Dashboard Controls

Surveillance Dashboard

Coordinate input (manual X, Y, Z)

Altitude slider (10–50m)

Thermal vision toggle

Target list and surveillance progress

Attack Dashboard

Target selection

Missile launch (when lock complete)

Emergency return to base

Health monitor (drone damage status)

📁 Project Structure
UAV/
├── public/
│   └── models/
│       ├── army_base/
│       ├── building/
│       ├── drone/
│       ├── effects/
│       ├── jeep/
│       ├── mountain/
│       ├── soldier/
│       ├── sounds/
│       ├── surveillance-uav/
│       └── tank/
├── src/
│   ├── components/
│   │   ├── anti-drone/
│   │   ├── attack-drone/
│   │   ├── drone-selector/
│   │   ├── mission/
│   │   └── ...
│   ├── hooks/
│   ├── store/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js

🏗️ Architecture
Technology Stack
Technology	Purpose
React 18	UI framework
Three.js	3D graphics engine
React Three Fiber	React renderer for Three.js
@react-three/drei	Helper utilities for R3F
Zustand	State management
Material-UI	UI component library
Vite	Build tool & dev server
Data Flow
User Input (click/keys)  -->  Zustand Store (state)  -->  3D Scene (Three.js)
                                      |
                                      v
                               Dashboard UI (Material-UI)

🧩 Components Overview
Core Components
Component	File	Description
App	App.jsx	Root application container
Scene	src/components/Scene.jsx	3D scene setup & renderer
UAV	UAV.jsx	UAV 3D model and rendering
UAVController	UAVController.jsx	Movement & physics
Terrain	Terrain.jsx	Terrain model
Dashboard Components
Component	File
CommandDashboard	CommandDashboard.jsx
AttackDashboard	AttackDashboard.jsx
BatteryIndicator	BatteryIndicator.jsx
LiveCameraView	LiveCameraView.jsx
Target Components
Component	File
Tank	Tank.jsx
Jeep	Jeep.jsx
Warehouse	Warehouse.jsx
Soldier	src/components/Soldier.jsx
Anti-Drone System
Component	File
AntiDroneSystem	AntiDroneSystem.jsx
DefenseProjectile	DefenseProjectile.jsx
DefenseBomb	DefenseBomb.jsx
RadarSweepEffect	RadarSweepEffect.jsx
Attack Drone
Component	File
AttackUAV	src/components/attack-drone/AttackUAV.jsx
MissileSystem	src/components/attack-drone/MissileSystem.jsx
TargetLockSystem	src/components/attack-drone/TargetLockSystem.jsx
FireEffect	src/components/attack-drone/FireEffect.jsx
CrashedUAV	CrashedUAV.jsx
Environment
Component	File
DayEnvironment	DayEnvironment.jsx
NightEnvironment	src/components/NightEnvironment.jsx
RainEnvironment	RainEnvironment.jsx
🗄️ State Management

Application uses Zustand with specialized stores.

UAV Store (src/store/uavStore.js)
{
  position: [x, y, z],           // current UAV position
  rotation: [rx, ry, rz],       // UAV rotation
  targetPosition: [x, y, z],    // movement target
  isThermalVision: false,
  isCrashed: false,
  battery: 100,
  droneType: 'surveillance' | 'attack',
  targets: []
}

Mission Store (src/store/missionStore.js)
{
  missionStatus: 'planning' | 'active' | 'completed',
  missionParameters: {},
  missionTimeRemaining: 0,
  completedObjectives: []
}

Attack Drone Store (src/store/attackDroneStore.js)
{
  droneHealth: 100,
  targeting: {},
  destroyedTargets: [],
  missiles: []
}

Camera Store (src/store/cameraStore.js)
{
  cameraMode: 'third-person' | 'first-person' | 'down-facing',
  cameraSettings: {}
}

Target Store (src/store/targetStore.js)
{
  detectedTargets: [],
  completedTargets: {}
}

Click Control Store (src/store/clickControlStore.js)
{
  isClickToMoveEnabled: true,
  clickIndicator: {},
  spawnIndicator: {}
}

Environment Store (src/store/environmentStore.js)
{
  environment: 'day' | 'night' | 'rain',
  windSpeed: 0,
  visibility: 1
}

🎨 3D Models & Assets
Model Sources

All 3D models are licensed under CC-BY-4.0 and sourced from Sketchfab (see each model folder for full attribution).

Model	Author	Location
UAV	Artem Goyko	public/models/drone/
Terrain	Pukar Shiwakoti	public/models/mountain/
Tank	See license	public/models/tank/
Jeep	See license	public/models/jeep/
Building	See license	public/models/building/
Audio

public/models/sounds/explosion.mp3 — explosion SFX

public/models/sounds/explo.mp3 — missile launch SFX

⚙️ Configuration
vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})

Key constants
UAV settings (UAVController.jsx)
const HOVER_HEIGHT = 15;           // default hover altitude (m)
const WIND_GUST_MIN_INTERVAL = 10; // seconds
const WIND_GUST_MAX_INTERVAL = 30; // seconds

Defense system (AntiDroneSystem.jsx)
const RADAR_RADIUS = 50;           // detection range (m)
const MIN_SAFE_ALTITUDE = 20;      // below this altitude = stealth

Target detection
const SCAN_RADIUS = 20;            // detection radius (m)

🤝 Contributing

Fork the repository

Create a branch:

git checkout -b feature/amazing-feature


Commit changes:

git commit -m "Add amazing feature"


Push and open a Pull Request

Development guidelines

Follow existing code style and patterns

Document complex logic with comments

Update README for new features

Test thoroughly before submitting PR

📄 License

This project is licensed under the MIT License — see LICENSE for details.

3D models are licensed under CC-BY-4.0. See individual license files in public/models/ for attribution and requirements.

🙏 Credits
3D Models

UAV Model: Artem Goyko — CC-BY-4.0

Snowy Mountain Terrain: Pukar Shiwakoti — CC-BY-4.0

Technologies

React · Three.js · React Three Fiber · Zustand · Material-UI · Vite

