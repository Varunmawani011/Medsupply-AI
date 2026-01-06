# MedSupply AI (Rehabionix)

An AI-powered medicine supply intelligence platform designed to forecast demand, detect outbreak risks, and manage pharmaceutical inventory in real-time.

## 🚀 Overview

MedSupply AI bridges the gap between community health signals and the pharmaceutical supply chain. By analyzing symptom clusters reported by the community, the platform's AI Agent (powered by Google Gemini) predicts demand spikes and alerts warehouse managers to potential shortages before they become critical.

## ✨ Key Features

- **AI Control Tower**: A centralized dashboard showing real-time supply chain health, risk analysis, and automated logistics recommendations.
- **Outbreak Detection**: Analyzes community symptom reports (e.g., spikes in fever/cough) to map regional health risks.
- **Dynamic Inventory**: Manage stock levels with visual status indicators, expiry tracking, and critical threshold alerts.
- **Supplier Portal**: A dedicated interface for pharmaceutical suppliers to monitor demand signals and commit production capacity.
- **Community Health Check**: An anonymous reporting portal for citizens to contribute data to the health surveillance network.

## 🛠️ Tech Stack

- **Framework**: React 19
- **Type System**: TypeScript
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini 3 Flash API
- **Visualization**: Recharts (Demand/Supply forecasting)
- **Icons**: Lucide React

## 📦 Getting Started

### Prerequisites

- A modern web browser.
- A Google Gemini API Key (set as `API_KEY` in your environment).

### Running Locally

This project uses **ES Modules (ESM)** directly from `esm.sh`, meaning no complex build pipeline is required for quick previews.

1. Clone the repository.
2. Open `index.html` via a local server (e.g., Live Server for VS Code).
3. The application will resolve dependencies automatically from the ESM CDN.

## 🤖 AI Agent Logic

The core intelligence resides in `services/mockBackend.ts`. It contextually analyzes:
1. Current warehouse inventory levels.
2. Anonymized community symptom reports.
3. Historical demand trends.

It then generates structured JSON insights detailing risk levels, predicted unit demand, and specific logistics actions (e.g., "Dispatch 1000 units of Tamiflu to North Sector").

---
*Developed as a high-performance healthcare logistics demonstration.*