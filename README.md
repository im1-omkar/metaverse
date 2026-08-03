#  Metaverse: The 2D Multiplayer Virtual Workspace

Metaverse is a retro-styled, 2D multiplayer virtual workspace designed for remote teams to collaborate, build, and interact in real-time. It combines classic pixel-art arcade aesthetics with modern real-time communication technologies, allowing users to move around a virtual office space and talk via peer-to-peer video and audio.

---

##  Tech Stack

**Monorepo & Build System**
*   **Turborepo** - High-performance build system for JavaScript/TypeScript monorepos.
*   **Bun** - Extremely fast all-in-one JavaScript runtime, bundler, and package manager.

**Frontend Framework & UI (`apps/web`)**
*   **Next.js (App Router)** - React framework for building the web application.
*   **TypeScript** - Type-safe JavaScript.
*   **Tailwind CSS** - Utility-first styling for fast, responsive layouts.
*   **Lucide React** - Beautiful, consistent icon set.

**Game Engine**
*   **Phaser 3** - Fast, robust 2D game framework used for rendering the map, character sprites, collisions, and camera mechanics.

**Real-Time & Networking (`apps/ws`)**
*   **WebSockets (ws)** - Custom server for low-latency real-time player movement and state synchronization.
*   **WebRTC** - Peer-to-peer real-time video and audio communication.
*   **STUN Servers** - Google's public STUN servers for NAT traversal.

**State Management & Data (`apps/api`)**
*   **Zustand** - Lightweight, fast state management (`useGameStore`, `useMediaStore`).
*   **REST API** - Used for user authentication (JWT) and data fetching.

---

##  Key Features

*   **👾 Retro Arcade UI:** Fully immersive pixel-art aesthetic featuring custom CSS grid backgrounds, chunky 3D buttons, and floating UI elements.
*   **🔐 Authentication System:** Secure user registration and login utilizing JWT stored securely in `localStorage`.
*   **🏢 Space Dashboard:** An interactive dashboard to view, select, and enter different virtual rooms (e.g., Main Office, Conference Room).
*   **🧙‍♂️ Character Selection Lobby:** A responsive pre-game lobby where users can select their 2D avatar (Harry, Ginny, Hermione, Ron) and preview their webcam/microphone before entering.
*   **🗺️ Interactive 2D World:** A fully explorable 2D office environment with physics boundaries (walls, computers) and dynamic camera following.
*   **🎥 P2P Video/Audio Chat:** Seamlessly integrated floating video bubbles of all players in the room, supporting dynamic mic/camera toggling.

---

##  Project Architecture

This project is structured as a **Turborepo** monorepo, allowing the frontend, API, and WebSocket servers to share configurations and dependencies while running concurrently.

1.  **Next.js Application (Client):** Handles UI rendering, authentication, and layout logic.
2.  **Phaser Game Canvas:** Injected into the Next.js DOM. It listens for keyboard inputs and updates the local player sprite.
3.  **WebSocket Server (Sync):** The Phaser engine pushes coordinate and animation state (`x`, `y`, `anim`) to the WS server, which broadcasts it to all other connected clients to move their remote sprites.
4.  **WebRTC Signaling:** When the WS server detects a `player_joined` event, it acts as the signaling server to exchange WebRTC Offers, Answers, and ICE candidates, establishing a direct P2P media connection between clients.

---

##  Getting Started

### Prerequisites
Make sure you have [Bun](https://bun.sh/) installed on your machine. 

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/metaverse.git](https://github.com/your-username/metaverse.git)
cd metaverse



Controls
Movement: Use the Arrow Keys (Up, Down, Left, Right) to navigate the virtual space.

Media Toggle: Use the floating action bar at the bottom of the screen to mute your microphone or turn off your camera.