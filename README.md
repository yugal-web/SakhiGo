# 🛡️ SakhiGo — Your Safety Companion, Always By Your Side

> **"Sakhi"** means a trusted friend. SakhiGo is that friend who's always with you — one tap away from help.

SakhiGo is a mobile-first Progressive Web App (PWA) built to help women feel safer while commuting, traveling alone, or navigating unfamiliar areas — with instant SOS alerts, live location sharing, crowdsourced safety data, and an AI-powered safety assistant.

Built at [Hackathon Name] under the **Women Safety & Social Impact** theme.

---

## 🚨 The Problem

Millions of women deal with the quiet anxiety of commuting alone — late from work, walking to a hostel, or navigating an unfamiliar city. In an emergency, existing solutions are often too slow, too complicated, or require downloading a heavy native app they'll never use again.

**SakhiGo removes friction.** No app store, no signup barriers — just open the link, and help is one tap away.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🆘 **One-Tap SOS** | Instantly alerts pre-saved emergency contacts with live location via SMS/WhatsApp |
| 📍 **Live Location Sharing** | Trusted contacts can track your location in real-time for a set duration |
| 📞 **Fake Call Trigger** | Simulates an incoming call to help exit uncomfortable situations discreetly |
| 🗺️ **Safety Heatmap** | Crowdsourced reporting of unsafe zones, visualized on an interactive map |
| 🤖 **AI Safety Assistant** | Instant guidance — nearest police station, helpline numbers, calming instructions |
| 📱 **Installable PWA** | Works like a native app — no app store required, installs to home screen |

---

## 🏗️ Tech Stack

**Frontend**
- HTML5, CSS3, JavaScript
- Progressive Web App (installable, offline-capable manifest + service worker)

**Backend**
- Java (Spring Boot) — REST APIs for auth, contacts, alerts, and reports

**Database**
- MySQL / PostgreSQL — users, emergency contacts, safety reports

**APIs & Integrations**
- Google Maps API — live location & heatmap visualization
- Twilio API — SMS/WhatsApp emergency alerts
- AI Chatbot API (Gemini/OpenAI) — safety guidance assistant

---

## 🖥️ Screens / User Flow

```
Login/Signup → Home Dashboard → SOS Button
                    │
                    ├── Manage Emergency Contacts
                    ├── Live Location Sharing
                    ├── Safety Heatmap (report/view unsafe zones)
                    └── AI Safety Chat Assistant
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven
- MySQL/PostgreSQL running locally
- Node.js (if using a build step for frontend assets)

### Setup

```bash
# Clone the repository
git clone https://github.com/<your-username>/sakhigo.git
cd sakhigo

# Configure the database
# Update application.properties with your DB credentials

# Run the backend
cd backend
mvn spring-boot:run

# Open the frontend
cd frontend
# Serve index.html via any local server, e.g.:
npx serve .
```

Visit `http://localhost:3000` (or your configured port) to launch SakhiGo.

### Environment Variables

Create a `.env` file (or configure in `application.properties`):

```
DB_URL=your_database_url
DB_USERNAME=your_username
DB_PASSWORD=your_password
GOOGLE_MAPS_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
AI_API_KEY=your_key
```

---

## 👥 Team

| Name | Role |
|---|---|
| [Your Name] | Backend Development (Java/Spring Boot, DBMS) |
| [Teammate] | Frontend Development |
| [Teammate] | UI/UX Design |
| [Teammate] | AI Integration |

---

## 🎯 Impact

Women's safety concerns while commuting are a widespread and persistent issue, and existing solutions are often underused due to complexity or low awareness. SakhiGo aims to close that gap with a **zero-friction, always-accessible** safety net — because feeling safe shouldn't require a complicated setup.

---

## 🔮 Future Scope

- Native mobile app with background location tracking
- Voice-activated SOS (hands-free emergency trigger)
- Integration with local police/helpline APIs for direct dispatch
- Community verification of safety reports to reduce false flags
- Offline SOS via SMS fallback (no internet required)

---

## 📄 License

This project was built for [Hackathon Name] 2026. Licensed under the [MIT License](LICENSE).

---

<p align="center">Built with ❤️ for a safer world — Team SakhiGo</p>
