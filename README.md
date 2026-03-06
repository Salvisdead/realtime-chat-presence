# Realtime Chat + Presence (React + Firebase)

A simple realtime team chat app built with **React (Vite)** and **Firebase (Auth + Firestore)**.  
It supports login/register, rooms, realtime messages, pagination, online presence, and a basic typing indicator.

---

## Features

- ✅ Email/Password Auth (register, login, logout)
- ✅ Rooms list (Firestore realtime listener)
- ✅ Realtime messages per room (`onSnapshot`)
- ✅ Send message
- ✅ Message timestamps
- ✅ Pagination: loads latest N + “Load more”
- ✅ Presence (best-effort): online/offline + lastSeen
- ✅ Online users list
- ✅ Typing indicator (simple + debounced)
- ✅ Firestore Security Rules (only authenticated users, write-as-self)

---

## Tech Stack

- React + TypeScript (Vite)
- Firebase Auth
- Cloud Firestore (realtime listeners)

---

## Setup

### 1) Install
```bash
npm install