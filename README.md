# Wasalha 🚗

> A women-only ride-hailing and mobility platform built with React Native and Expo.

Wasalha (وصلها) is a safety-first mobility app designed exclusively for women — as riders, drivers, and instructors. Every feature is built around trust, transparency, and community.

---

## Features

### Ride Services
- **Standard rides** — economy, comfort, and premium car tiers
- **Scooter rides** — short-distance electric scooter rentals
- **Intercity travel** — long-distance shared rides between cities
- **Reservations** — schedule rides in advance with reminder notifications

### Driving Lessons
- Browse certified female instructors and their lesson packages
- Track session progress in-app
- Instructors manage availability and student rosters through a dedicated UI

### Safety
- **Guardian Shield** — live GPS location sharing with emergency contacts during any ride
- **SOS alert** — one-tap distress signal sent to emergency contacts
- **Dashcam footage review** — riders and drivers can request and review dashcam clips from past rides
- **Incident reporting** — report drivers or riders with optional dashcam evidence attached

### Account System
- Single account, multiple roles — a user can be a rider, driver, and instructor simultaneously
- In-app role switching without logging out
- Role-specific dashboards and navigation

### Supporting Features
- **Lost item requests** — contact your recent driver to search for left-behind items
- **Saved destinations** — store home, work, and frequent locations for one-tap selection
- **Emergency contacts** — manage who gets notified during Guardian Shield sessions
- **Ride history** — full log of past rides and lessons with fare breakdown
- **In-app messaging** — chat between rider and driver during active rides
- **Push notifications** — ride status updates, lesson reminders, SOS alerts
- **Promo codes** — apply discount codes at checkout

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 54) |
| Navigation | Expo Router (file-based) |
| Database | expo-sqlite (local SQLite) |
| Form validation | react-hook-form + Zod |
| Authentication | SHA-256 password hashing via expo-crypto |
| Session storage | expo-secure-store |
| Haptics | expo-haptics |
| Image picking | expo-image-picker |
| Icons | @expo/vector-icons (Ionicons, AntDesign) |
| SVG support | react-native-svg + react-native-svg-transformer |
| Fonts | Plus Jakarta Sans (via @expo-google-fonts) |
| Language | TypeScript |

---

## Project Structure

```

```

---

## Database Schema


---

## Getting Started

### Prerequisites
- Node.js 18 or newer
- Expo CLI
- Expo Go app (Android recommended — iOS Expo Go supports SDK 54)

### Installation

```bash
git clone https://github.com/Zorro-oreo/Wasalha.git
cd Wasalha
npm install --legacy-peer-deps
```

### Running the app

```bash
npx expo start -c

```

Scan the QR code with Expo Go on your device.

### Environment notes
- Developed on Windows (PowerShell) — Android is the primary test target
- Metro bundler offline mode available via `npx expo start --offline` if network issues occur
- If you hit ERESOLVE npm errors, use `npm install --legacy-peer-deps`

---

## Authentication

The auth screen features:
- Animated sliding pill toggle between Sign In and Sign Up
- Crossfade form transition with no page navigation
- Inline field-level error messages via Zod validation
- Password strength indicator (Weak / Fair / Good / Strong)
- SHA-256 password hashing before any database write
- Show/hide password toggle on all password fields
- Haptic feedback on all interactive actions
- "Remember me" via expo-secure-store *(session persistence — in progress)*

Social auth buttons (Apple, Google) are present in the UI and pending backend integration.

---

## Roadmap

- [ ] Home screen with live ride matching
- [ ] Driver dashboard and ride acceptance flow
- [ ] Instructor dashboard and lesson management UI
- [ ] Guardian Shield live location implementation (expo-task-manager)
- [ ] Dashcam footage viewer
- [ ] Google Sign In integration
- [ ] Apple Sign In (requires Apple Developer account)
- [ ] Push notifications (expo-notifications)
- [ ] Payment integration
- [ ] Session persistence with expo-secure-store

---

## Design

The app was designed in Figma before development. The visual identity uses:
- **Primary pink:** `#B85A9A`
- **Lavender accent:** `#534AB7`
- **Body background:** `#F5F3FB`
- **Typography:** Plus Jakarta Sans (Regular, Bold, ExtraBold)

---

## License

This project was built as a UX/UI course final project and is intended for educational and portfolio purposes.