# Badminton Queue System 🏸

Fair, fast court rotation for crowded club meetings. Built to keep 30+ players moving on 3 courts while I (the organizer) still get to play.

---

## Why this exists

As a student and VP of GGC Badminton club, balancing **running sessions** and **training** is hard—only 12 can play at a time. This tool automates queues, timers, and court assignments so everyone gets court time without vibe-killing arguments.

---

## Features (MVP)

* **3 Court Dashboards**: each shows a **15‑min countdown**, **current players**, and a **queue**.
* **One‑click Controls**: Start, pause/end early, clear queue items.
* **Team/Player Intake**: add names at the top; route to court 1/2/3 or general queue.
* **Fair Rotation**: dequeue in order; quick swaps between courts.
* **Accessible UI**: keyboard‑friendly, large contrast text.

> **Planned**: mobile self‑join (QR), role‑based admin, persistent storage, stats, and deployment.

---

## Status (Aug 27, 2025)

* ✅ Queue logic (basic)
* ✅ Initial interface layout (in progress to polish)
* 🔜 Front‑end refinement (state mgmt, edge cases)
* 🔜 Deploy to the web
* 🔜 Let players add themselves from their phones

---

## Tech Stack

* **React + Vite** (fast dev server)
* **JavaScript** (type safety)
* **Tailwind CSS** (rapid UI)
* Optional later: state with **Zustand/Redux**, persistence via **Supabase/Firebase**, hosting on **Vercel/Netlify**

---

## Quick Start

```bash
# 1) Create app (if starting fresh)
npm create vite@latest badminton-queue-system -- --template react-ts
cd badminton-queue-system

# 2) Install deps
npm install

# 3) Dev server
npm run dev   # open the shown URL
```

> Already have a repo? Just `npm install` then `npm run dev`.

---

## Usage (club-night flow)

1. **Open the dashboard** on a laptop/tablet near the courts.
2. **Add players** at the header. Choose court or general queue.
3. **Start timer** on each court when play begins (default 15:00).
4. When time’s up (or a match ends early), **end** → rotate next 4 players.
5. Keep playing; the **queue auto-advances** in order.

---

## Configuration

* **Timer length**: will be configurable per court (default 15:00).
* **Court count**: currently 3 (roadmap: dynamic).
* **Name rules**: short names/initials encouraged.

---

## Project Structure (proposed)

```
src/
  components/
    CourtPanel.tsx      # timer + players + queue
    PlayerInput.tsx     # add names, assign court
    QueueList.tsx       # reusable queue list
  hooks/
    useTimer.ts         # pause/resume/reset logic
  state/
    store.ts            # players, courts, queues
  styles/
    index.css
  App.tsx
  main.tsx
```

---

## Roadmap

* [ ] **Mobile self-join** via QR link (PWA)
* [ ] **Deploy** to Vercel/Netlify
* [ ] **Persistent storage** (Supabase/Firebase)
* [ ] **Admin mode** (lock courts, force-rotate, remove no-shows)
* [ ] **Stats** (games played, wait time, attendance)
* [ ] **Dynamic courts** (2–6)
* [ ] **Accessibility polish** (ARIA, focus traps, color contrast audits)

---

## Contributing (future‑proof)

* Use **conventional commits** (e.g., `feat: add per-court timer setting`).
* Keep components **small and testable**.
* Write **unit tests** for timer/queue logic before refactors.

---

## License

MIT. Use it for your club, tweak it for your needs.

---

## Credits

Built by a badminton‑obsessed computer engineering student. Feedback and PRs welcome!

---

## Screenshots / Demo (placeholders)

* `/docs/screenshot-dashboard.png`
* `/docs/demo.mp4` (optional)
