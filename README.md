<div align="center">
  <img src="frontend/public/icon.svg" alt="KaamSetu Logo" width="120" height="120" />
  <h1>KaamSetu AI 🌉</h1>
  <p><strong>The world's first cross-border AI safety net for informal and migrant workers across BRICS nations.</strong></p>
</div>

<hr />

## 🌟 Overview

There are over 800+ million informal workers across BRICS nations (India, Brazil, Russia, China, South Africa) who are entitled to government schemes, welfare programs, and legal protections but face significant barriers to accessing them due to language, digital literacy, and bureaucracy.

**KaamSetu AI** bridges this gap. It acts as an intelligent, empathetic, voice-first companion that speaks to workers in their native languages (Hindi, Portuguese, Mandarin, Russian, Zulu, Tamil, Bengali, English), understands their skills, and instantly connects them to the social safety nets they deserve.

## ✨ Features

- **🗣️ Voice-First AI Onboarding**: Zero jargon, no complex forms. Workers simply speak to the AI in their native language to generate their profile.
- **🪪 Universal KaamID**: A portable, verifiable digital identity card generated instantly for unregistered workers, complete with a QR code and offline storage support.
- **🎯 Smart Scheme Matching**: Uses Groq's blazing-fast LLMs to match workers to the exact government welfare schemes they qualify for based on their location, trade, and experience.
- **🚨 Distress Signal Detection**: Actively detects signs of wage theft, workplace injury, or unsafe conditions from worker conversations and instantly flags them for intervention.
- **📊 Policy Dashboard**: A secure, real-time analytics heatmap for policymakers to track labor trends, wage disputes, and distress hotspots across regions.
- **📱 PWA & Offline Support**: Fully installable Progressive Web App (PWA) designed for low-end mobile devices and spotty network connectivity.
- **📞 Feature Phone Fallback (USSD)**: Integrated USSD simulation for workers without smartphones to access schemes via SMS.

## 🏗️ Architecture & Tech Stack

KaamSetu AI uses a decoupled client-server architecture designed for speed, scale, and accessibility.

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **PWA**: `next-pwa` for offline capabilities and service workers
- **Key APIs**: Web Speech API (Voice-to-Text), HTML2Canvas (KaamID Export)

### Backend
- **Server**: Node.js & Express.js
- **Database**: In-memory / Firebase Firestore ready
- **AI Core**: Groq SDK (`llama3-70b-8192`) for sub-second, highly empathetic natural language processing and structured data extraction.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A [Groq API Key](https://console.groq.com/) for the AI engine

### 1. Clone the repository
```bash
git clone https://github.com/Yash151005/KaamSetu.git
cd KaamSetu
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add your Groq API Key:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
FRONTEND_URL=http://localhost:3000
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```
Start the Next.js development server:
```bash
npm run dev
```

### 4. Explore the App
- **Worker Portal (Public)**: [http://localhost:3000/worker](http://localhost:3000/worker)
- **Policy Dashboard (Secure)**: [http://localhost:3000/policy](http://localhost:3000/policy) *(PIN: POLICY2026)*
- **USSD Emulator**: [http://localhost:3000/ussd](http://localhost:3000/ussd)

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Our mission is to expand this safety net to more languages and regional government integrations.

## 📄 License
This project is licensed under the MIT License.
