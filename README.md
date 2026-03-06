# 🏙️ CityWatch

<div align="center">

**Smart City Infrastructure Capacity & Utilization Monitor**

*Predict · Simulate · Plan · Protect*

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.0_Flash-AI_Powered-4285F4?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [How We Solve It](#-how-we-solve-it)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Authentication & Roles](#-authentication--roles)
- [Simulation Engine](#-simulation-engine)
- [Design System](#-design-system)
- [SDG Alignment](#-sdg-alignment)
- [Team](#-team)

---

## 🔭 Overview

**CityWatch** is a full-stack smart city infrastructure intelligence platform that monitors real-time capacity and utilization across **9 city zones** and **4 infrastructure types** — Roads, Power Grid, Water Supply, and Healthcare.

It serves two distinct audiences:

| Audience | Access | Purpose |
|---|---|---|
| 🏛️ **City Officials & Admins** | Admin Portal | Live monitoring, predictions, failure simulation, AI-assisted decision making |
| 👥 **Citizens** | Public Portal | Neighbourhood status in plain English, AI helpdesk for infrastructure queries |

> Built during a **19-hour hackathon** as a response to the problem statement:  
> *"Develop a system to monitor how city infrastructure resources are being used relative to their intended capacity, highlighting congestion, overload, or underuse."*

---

## 🚨 Problem Statement

Cities today manage infrastructure **reactively**. The core issues:

- ❌ No unified real-time visibility into infrastructure capacity across departments
- ❌ Failures are discovered after they occur — from citizen complaints, not live data
- ❌ No forecasting of upcoming failures before they reach critical levels
- ❌ No tool to model how one failure (e.g. power) cascades into others (water, hospitals)
- ❌ Citizens have zero transparency — they can't plan around infrastructure stress
- ❌ Urban planners can't simulate: *"What if 50,000 new residents move here?"*

---

## ✅ How We Solve It

| Problem | CityWatch Solution |
|---|---|
| No real-time visibility | Live heatmap dashboard — 9 zones × 4 assets, updates every 2 seconds |
| Failures discovered too late | Predictive breach analysis with countdown timer before failure |
| No cascade understanding | Cascade Failure Simulator — 3-wave propagation model with live animation |
| No future planning tool | What-If Scenario Engine — simulate population growth and city events |
| Citizens kept in the dark | Public Portal + CityAssist AI with plain English status |
| Sub-infrastructure blind spots | CRUD Zone Manager — add custom monitors that feed live into simulation |

---

## ✨ Features

### 🔴 Admin Portal — For City Officials

<details>
<summary><strong>1. Live Dashboard</strong> — Real-time city overview</summary>

<br>

The command center for city officials. Monitors all 9 zones simultaneously with data refreshing every 2 seconds.

- **3×3 Zone Heatmap** — each zone color-coded by utilization (green → amber → red)
- **City Health Score** — weighted 0–100 score, calculated by zone population × utilization
- **Priority Triage List** — zones ranked by `utilization × population` to maximize human impact focus
- **KPI Cards** — Critical assets count, Warning assets count, Population at risk, Custom monitors active
- **Asset Breakdown Table** — all 36 built-in data points + any custom monitors added by officials

</details>

<details>
<summary><strong>2. Predictive Breach Analysis</strong> — Know before it breaks</summary>

<br>

Uses **linear regression** on a 30-point rolling history (last 60 seconds) to forecast when each asset will cross the critical 90% threshold.

- **Solid line** = live historical trend
- **Dashed line** = AI-projected trajectory for next 24 seconds
- **BREACH IN ~Xs** — real-time countdown timer per asset
- **All-zone summary table** — breach forecasts for every zone at a glance
- Negative slope = shows **STABLE** badge — not all trends are concerning

> *"Reactive monitoring tells you when something broke. Predictive monitoring gives you time to act."*

</details>

<details>
<summary><strong>3. Cascade Failure Simulator</strong> — Model the chain reaction</summary>

<br>

Trigger a failure on any asset in any zone and watch the infrastructure chain reaction unfold across **3 time-delayed waves**.

**Dependency Rules:**
```
POWER fails  →  Water (+20%)  →  Healthcare (+18%)  →  Roads (+8%)
WATER fails  →  Healthcare (+15%)  →  Power (+5%)
ROADS fail   →  Healthcare (+12%)
```

**Wave Propagation:**

| Wave | Timing | Effect |
|---|---|---|
| Wave 1 | Immediate | Direct dependencies in the same zone stressed |
| Wave 2 | +1.5 seconds | Adjacent zones absorb load spillover |
| Wave 3 | +3.0 seconds | Secondary ripple to further zones |

**Additional Features:**
- Population-weighted severity multiplier (City Core at 95k hits harder than South East at 35k)
- Animated SVG dependency graph with flowing edges and wave rings
- Live cascade event log with per-wave color coding
- Snapshot-based reset — restores exact pre-cascade state
- Remediation action cards with department ownership and checkboxes

> **Real-world basis:** The 2012 India Blackout — a single power grid failure cascaded into water systems, hospitals, and transport, affecting **620 million people**.

</details>

<details>
<summary><strong>4. What-If Scenario Engine</strong> — Plan before problems happen</summary>

<br>

A proactive planning tool. Simulate future conditions on any zone before making decisions.

- **Population Slider** — add 0–60,000 extra residents, see projected load on all assets
- **Event Presets:**

  | Event | Primary Impact |
  |---|---|
  | 🎵 Concert / Rally | Roads +28%, Power +14% |
  | 🌪️ Natural Disaster | Healthcare +40%, Roads +20% |
  | 🚗 Peak Hour Traffic | Roads +25%, Power +18% |
  | 🏗️ Construction | Roads +35%, Water +14% |

- **Before/After Comparison** — stacked bars showing delta per asset
- **First Failure Banner** — identifies which asset breaks first and at what load level

> *Difference from Cascade Sim: What-If is proactive planning (nothing broken yet). Cascade Sim is reactive response (something just failed).*

</details>

<details>
<summary><strong>5. Zone Manager — CRUD Interface</strong></summary>

<br>

Full **Create, Read, Update, Delete** interface for infrastructure monitoring management.

| Operation | What You Can Do |
|---|---|
| **Create** | Add custom asset monitors (e.g. "Yamuna Pumping Station") — immediately join the live simulation |
| **Read** | View all 36 built-in data points with live utilization, trends, and status badges |
| **Update** | Edit zone alert thresholds, priority levels, and official notes per asset |
| **Delete** | Remove custom monitors — instantly dropped from simulation and all views |

**How Custom Asset Monitors Work:**

When an official adds a monitor, the simulation engine creates a new live data point that:
- Starts at the parent zone's baseline utilization ± a small random offset
- Tracks the parent asset with **12% correlation** + its own independent noise
- Appears live in Dashboard, Predictions, and Zone Manager
- Has its own configurable alert threshold (default 88% — early warning before zone-level 90%)
- Triggers toast notifications when threshold is crossed

**Audit Log:** Every change recorded — `[timestamp] [official name] [action] [affected asset]`

</details>

<details>
<summary><strong>6. CityCommand AI</strong> — AI assistant for officials</summary>

<br>

A **Gemini 2.0 Flash** powered AI built specifically for city government officials. Reads live city data before every response.

**Response Format — always structured:**
```
📊 SITUATION:      What's happening right now
🔍 ANALYSIS:       Data-driven insight with specific zone names & percentages
⚡ RECOMMENDATION:  2-3 specific actions to take immediately
📞 ESCALATE TO:    Which department to contact
```

**Smart Prompt Suggestions:**
- *"What are today's top 3 risks?"*
- *"Draft a public advisory for current situation"*
- *"What's the cascade risk if City Core power fails now?"*
- *"Which department should I alert first?"*
- *"Recommend resource pre-positioning"*

**Additional Features:**
- "Copy as Report" — copies response with timestamp + official attribution
- Trending indicators on zone sidebar (↑ rising / ↓ falling / → stable)
- Knows the logged-in official's name and department

</details>

---

### 🟢 Public Portal — For Citizens

<details>
<summary><strong>7. Public Portal</strong> — City status in plain English</summary>

<br>

A simplified citizen-facing view. No technical jargon, no percentages — just clear status information.

- **City Health Score** displayed as: `Good` / `Under Pressure` / `Critical Alert`
- **Neighbourhood Status Grid** — colored dots for each zone
- **Personalized View** — citizen's registered zone shown first with a "YOUR AREA" badge
- **Zone Detail Card** — dedicated status for all 4 assets in the citizen's neighbourhood
- **Emergency Contacts** — all city service numbers displayed prominently

</details>

<details>
<summary><strong>8. CityAssist AI</strong> — AI helpdesk for citizens</summary>

<br>

A **Gemini 2.0 Flash** powered helpdesk that reads live city data and helps citizens with real infrastructure problems.

- Reads actual live zone data — not a pre-scripted FAQ bot
- Knows the citizen's registered zone — answers *"is my area safe?"* accurately
- Plain English only — never uses technical terms
- Calm, empathetic responses with: empathy → current status → 2-3 actions → emergency contact

**Quick Reply Suggestions:**
*"Is my area safe right now?" · "No water — what do I do?" · "Power outage near me" · "Which zones are critical?" · "Give me emergency numbers"*

</details>

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React.js** | 18.x | Component-based UI, virtual DOM for efficient live updates |
| **Vite** | 5.x | Build tool and development server |
| **Recharts** | 2.x | LineChart + ReferenceLine for prediction visualizations |
| **SVG (inline)** | — | Cascade dependency graph — animated nodes, edges, wave rings |
| **CSS Keyframes** | — | Pulse, glow, flowDash, waveRing animations |

### React Hooks Used

| Hook | Usage in CityWatch |
|---|---|
| `useState` | Live zone data, simulation state, auth session, UI state |
| `useEffect` | Simulation timer (setInterval every 2s), cleanup on unmount |
| `useMemo` | City Health Score, AI system prompts, derived metrics |
| `useCallback` | triggerCascade(), deleteCustomAsset() |
| `useContext` | AuthContext — user session across all components |
| `useRef` | Chat scroll container, simulation tick counter |

### AI Integration

| Technology | Purpose |
|---|---|
| **Gemini 2.0 Flash** | Powers CityCommand (admin bot) and CityAssist (citizen bot) |
| **Google Generative Language API** | REST: `v1beta/models/gemini-2.0-flash:generateContent` |
| **Dynamic System Prompts** | Live city data injected into every API call via `useMemo` |

### Data & Storage

| Technology | Purpose |
|---|---|
| **localStorage** | User accounts, sessions, custom monitors, audit logs |
| **In-memory state** | All live simulation data — no database needed for prototype |

### Algorithms

| Algorithm | Where Used |
|---|---|
| **Linear Regression** | Breach prediction — slope from 30-point rolling history |
| **Mean Reversion** | Simulation engine — prevents drift, mimics real infrastructure cycles |
| **Population-weighted scoring** | City Health Score, Priority Triage, Cascade Severity |
| **Grid adjacency (3×3)** | Cascade propagation — finds neighbouring zones by row/col |

---

## 📁 Project Structure

```
citywatch/
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── App.jsx                          # Root router — auth flow + role rendering
│   │
│   ├── context/
│   │   └── AuthContext.jsx              # Auth state, signIn, signUp, signOut
│   │
│   ├── hooks/
│   │   ├── useSimulation.js             # Live simulation engine + custom asset CRUD
│   │   └── useCityData.js               # Derived metrics — health score, alerts, risk
│   │
│   ├── data/
│   │   └── cityConstants.js             # Zone names, baselines, dependencies, thresholds
│   │
│   └── components/
│       ├── auth/
│       │   ├── LandingPage.jsx          # Role selection — Admin or Citizen
│       │   ├── SignInForm.jsx           # Login form (role-aware)
│       │   └── SignUpForm.jsx           # Registration form (role-aware)
│       │
│       ├── layout/
│       │   ├── AdminLayout.jsx          # Sidebar + header + toast notifications
│       │   └── PublicLayout.jsx         # Minimal navbar for citizen app
│       │
│       ├── shared/
│       │   ├── StatusBadge.jsx          # NORMAL / WARNING / CRITICAL pill
│       │   ├── UtilBar.jsx              # Animated colored progress bar
│       │   ├── SectionTitle.jsx         # Dim uppercase section header
│       │   └── ZoneCard.jsx             # Reusable heatmap zone card
│       │
│       ├── admin/
│       │   ├── Dashboard.jsx            # KPIs + heatmap + priority triage
│       │   ├── Predictions.jsx          # Breach forecast + recharts panels
│       │   ├── CascadeSim.jsx           # 3-wave cascade failure simulator
│       │   ├── WhatIf.jsx               # Scenario planning engine
│       │   ├── ZoneManager.jsx          # CRUD interface for asset monitoring
│       │   └── AdminBot.jsx             # CityCommand AI for officials
│       │
│       └── public/
│           ├── PublicPortal.jsx         # Citizen status view
│           └── CitizenBot.jsx           # CityAssist AI for citizens
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18.0 or above — [Download here](https://nodejs.org)
- **Gemini API Key** (free) — [Get one at Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/citywatch.git

# 2. Navigate into the project
cd citywatch

# 3. Install all dependencies
npm install

# 4. Start the development server
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### Build for Production

```bash
npm run build      # Creates optimised build in /dist
npm run preview    # Preview the production build locally
```

### Gemini API Key Setup

1. Visit [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create a free API key
3. After logging into CityWatch, go to **AI Assistant** (admin) or **CityAssist** (citizen)
4. Click **⚙️ API Key** and paste your key
5. The key is stored in session memory only — never saved to localStorage

---

## 🔐 Authentication & Roles

CityWatch uses a **role-based access system** with two separate registration flows.

### Admin Registration (City Officials)

1. Click **"City Officials Portal"** on the landing page
2. Select **"Register as Official"**
3. Fill in: Name, Email, Password, Department

**Available Departments:**
`Traffic Management` · `Power Authority` · `Water Department` · `Healthcare Administration` · `City Planning` · `Emergency Services`

### Citizen Registration

1. Click **"Citizen Portal"** on the landing page
2. Select **"Register as Citizen"**
3. Fill in: Name, Email, Password, Home Neighbourhood

### Access Control

| Feature | Admin | Citizen |
|---|---|---|
| Live Dashboard | ✅ | ❌ |
| Predictions | ✅ | ❌ |
| Cascade Simulator | ✅ | ❌ |
| What-If Engine | ✅ | ❌ |
| Zone Manager (CRUD) | ✅ | ❌ |
| CityCommand AI | ✅ | ❌ |
| Public Portal | ❌ | ✅ |
| CityAssist AI | ❌ | ✅ |

> **Note:** Auth is simulated via localStorage for this prototype. Production would use JWT tokens, bcrypt password hashing, and a secure backend API.

---

## ⚙️ Simulation Engine

CityWatch uses a realistic simulation engine that mimics real infrastructure behaviour. In production, this would be replaced by live IoT sensor / SCADA system feeds.

### Core Formula (runs every 2 seconds per data point)

```
newValue = current + reversion + noise

where:
  reversion = (target − current) × 0.08
  noise     = random(−1.5, +1.5)
  target    = zoneBaseline × timeOfDayMultiplier
```

### Time-of-Day Patterns

| Asset | Peak Time | Peak Load | Low Time | Low Load |
|---|---|---|---|---|
| Roads | 6:00 PM | 110% of baseline | 3:00 AM | 10% of baseline |
| Power Grid | 6:00 PM | 100% of baseline | 3:00 AM | 32% of baseline |
| Water Supply | 8:00 AM | 90% of baseline | 3:00 AM | 25% of baseline |
| Healthcare | 11:00 AM | 92% of baseline | 3:00 AM | 48% of baseline |

- One full **24-hour simulated day** cycles every **~3 real minutes**
- **9 zones × 4 built-in assets = 36 live data points** always active
- **Custom monitors** add additional correlated data points dynamically

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Background | `#06060F` | Page background |
| Card Surface | `#0C0C1E` | All card and panel surfaces |
| Border | `#14142A` | Card borders, dividers |
| Blue | `#60A5FA` | Admin accent, primary actions |
| Purple | `#A78BFA` | Secondary accent, custom assets |
| Teal | `#2DD4BF` | Public portal accent |
| 🟢 Normal | `#10B981` | Utilization below 75% |
| 🟡 Warning | `#F59E0B` | Utilization 75–90% |
| 🔴 Critical | `#EF4444` | Utilization above 90% |
| Text | `#D4D4E8` | Primary body text |
| Dim Text | `#64748B` | Labels, secondary text |

### Status Thresholds

```
< 75%    →  NORMAL    (green)
75–90%   →  WARNING   (amber)
> 90%    →  CRITICAL  (red)
```

---

## 🌍 SDG Alignment

<div align="center">

**United Nations Sustainable Development Goal 11**  
*Sustainable Cities and Communities*

</div>

> **Target 11.b:** Substantially increase the number of cities adopting integrated policies and plans towards inclusion, resource efficiency, climate change mitigation and adaptation, and resilience to disasters.

CityWatch directly enables **data-driven city infrastructure management** — the monitoring, prediction, and simulation layer that makes smart, sustainable urban governance possible.

---

## 👥 Team

> Built in 19 hours at [Hackathon Name]

| Name | Role |
|---|---|
| [Team Member 1] | [Role] |
| [Team Member 2] | [Role] |
| [Team Member 3] | [Role] |

---

## 📄 License

```
MIT License — Copyright (c) 2026 CityWatch Team
Free to use, modify, and distribute with attribution.
```

---

<div align="center">

**CityWatch** — Built for SDG 11 · Powered by React + Gemini AI

*"The best time to fix infrastructure is before it fails."*

</div>
