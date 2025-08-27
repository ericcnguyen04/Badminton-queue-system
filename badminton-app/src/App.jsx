import React, { useEffect, useMemo, useRef, useState } from "react";

// === Constants ===
const NUM_COURTS = 3;
const DEFAULT_GAME_MINUTES = 15; // 15-minute sessions
const PLAYERS_PER_COURT = 4; // change to 2 for singles if desired

// === Helpers ===
function formatTime(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function useLocalStorageState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {}
  }, [key, state]);
  return [state, setState];
}

// SVG Circular progress
function CircularTimer({ seconds, totalSeconds }) {
  const radius = 56;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.max(0, Math.min(1, seconds / totalSeconds));
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          className="opacity-20"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-semibold tabular-nums">
          {formatTime(seconds)}
        </span>
      </div>
    </div>
  );
}

function CourtCard({ index, court, onStart, onEnd, onNext, onDeleteFromQueue, onShuffleQueue, onClearCurrent }) {
  const total = court.totalSeconds || DEFAULT_GAME_MINUTES * 60;
  return (
    <div className="flex flex-col gap-4 rounded-2xl p-4 shadow-sm border bg-white">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Court {index + 1}</h2>
        <div className="text-sm text-gray-500">{PLAYERS_PER_COURT} per game</div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-gray-800">
          <CircularTimer seconds={court.remainingSec} totalSeconds={total} />
        </div>
        <div className="flex-1">
          <div className="mb-2 text-sm font-semibold text-gray-600">Current Players</div>
          {court.current.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2">
              {court.current.map((p, i) => (
                <li key={i} className="rounded-xl bg-gray-50 px-3 py-2 text-sm">
                  {p}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">No one on court</div>) }
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => onStart(index)} className="rounded-xl px-3 py-2 text-sm font-medium shadow-sm border hover:bg-gray-50">
          Start Timer
        </button>
        <button onClick={() => onEnd(index)} className="rounded-xl px-3 py-2 text-sm font-medium shadow-sm border hover:bg-gray-50">
          End Timer
        </button>
        <button onClick={() => onNext(index)} className="rounded-xl px-3 py-2 text-sm font-medium shadow-sm border hover:bg-gray-50">
          Next Game
        </button>
        <button onClick={() => onClearCurrent(index)} className="rounded-xl px-3 py-2 text-sm font-medium shadow-sm border hover:bg-gray-50">
          Clear Current
        </button>
        <div className="ml-auto" />
        <button onClick={() => onShuffleQueue(index)} className="rounded-xl px-3 py-2 text-sm font-medium shadow-sm border hover:bg-gray-50">
          Shuffle Queue
        </button>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-gray-600">Queue</div>
        {court.queue.length === 0 ? (
          <div className="text-sm text-gray-500">Queue is empty</div>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {court.queue.map((name, i) => (
              <li key={i} className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                <span>{name}</span>
                <button
                  aria-label={`Remove ${name}`}
                  onClick={() => onDeleteFromQueue(index, i)}
                  className="rounded-full px-2 py-0.5 text-xs hover:bg-gray-100"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function BadmintonQueueTimer() {
  const [courts, setCourts] = useLocalStorageState(
    "badminton-courts-v1",
    Array.from({ length: NUM_COURTS }, () => ({
      queue: [],
      current: [],
      remainingSec: DEFAULT_GAME_MINUTES * 60,
      totalSeconds: DEFAULT_GAME_MINUTES * 60,
      running: false,
      lastTickAt: null,
    }))
  );

  const [name, setName] = useState("");
  const [courtTarget, setCourtTarget] = useState(0);

  // Ticking logic shared by all courts
  useEffect(() => {
    const id = setInterval(() => {
      setCourts((prev) => {
        const now = Date.now();
        return prev.map((c) => {
          if (!c.running) return c;
          const elapsed = 1; // tick by 1 second for simplicity
          const nextRemaining = Math.max(0, c.remainingSec - elapsed);
          if (nextRemaining === 0) {
            // Auto-advance to next game if queue has players
            const nextQueue = [...c.queue];
            const nextCurrent = nextQueue.splice(0, PLAYERS_PER_COURT);
            const hasNext = nextCurrent.length > 0;
            return {
              ...c,
              current: hasNext ? nextCurrent : [],
              queue: nextQueue,
              remainingSec: hasNext ? c.totalSeconds : c.totalSeconds,
              running: hasNext ? true : false,
            };
          }
          return { ...c, remainingSec: nextRemaining };
        });
      });
    }, 1000);
    return () => clearInterval(id);
  }, [setCourts]);

  const addToQueue = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCourts((prev) => {
      const next = [...prev];
      next[courtTarget] = {
        ...next[courtTarget],
        queue: [...next[courtTarget].queue, trimmed],
      };
      return next;
    });
    setName("");
  };

  const startTimer = (idx) => {
    setCourts((prev) => {
      const next = [...prev];
      const c = next[idx];
      let current = c.current;
      let queue = c.queue;
      if (current.length === 0) {
        current = queue.slice(0, PLAYERS_PER_COURT);
        queue = queue.slice(PLAYERS_PER_COURT);
      }
      next[idx] = {
        ...c,
        current,
        queue,
        remainingSec: c.totalSeconds,
        running: current.length > 0,
      };
      return next;
    });
  };

  const endTimer = (idx) => {
    setCourts((prev) => {
      const next = [...prev];
      const c = next[idx];
      next[idx] = {
        ...c,
        running: false,
        remainingSec: c.totalSeconds,
      };
      return next;
    });
  };

  const nextGame = (idx) => {
    setCourts((prev) => {
      const next = [...prev];
      const c = next[idx];
      const newCurrent = c.queue.slice(0, PLAYERS_PER_COURT);
      const newQueue = c.queue.slice(PLAYERS_PER_COURT);
      next[idx] = {
        ...c,
        current: newCurrent,
        queue: newQueue,
        remainingSec: c.totalSeconds,
        running: newCurrent.length > 0,
      };
      return next;
    });
  };

  const clearCurrent = (idx) => {
    setCourts((prev) => {
      const next = [...prev];
      const c = next[idx];
      next[idx] = { ...c, current: [], running: false, remainingSec: c.totalSeconds };
      return next;
    });
  };

  const removeFromQueue = (idx, qIdx) => {
    setCourts((prev) => {
      const next = [...prev];
      const c = next[idx];
      next[idx] = {
        ...c,
        queue: c.queue.filter((_, i) => i !== qIdx),
      };
      return next;
    });
  };

  const shuffleQueue = (idx) => {
    setCourts((prev) => {
      const next = [...prev];
      const c = next[idx];
      const arr = [...c.queue];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      next[idx] = { ...c, queue: arr };
      return next;
    });
  };

  const resetAll = () => {
    if (!confirm("Reset all courts?")) return;
    setCourts(
      Array.from({ length: NUM_COURTS }, () => ({
        queue: [],
        current: [],
        remainingSec: DEFAULT_GAME_MINUTES * 60,
        totalSeconds: DEFAULT_GAME_MINUTES * 60,
        running: false,
        lastTickAt: null,
      }))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-bold">Badminton Court Queue</h1>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Player name"
              className="rounded-xl border px-3 py-2 text-sm shadow-sm"
            />
            <select
              value={courtTarget}
              onChange={(e) => setCourtTarget(parseInt(e.target.value))}
              className="rounded-xl border px-3 py-2 text-sm shadow-sm"
            >
              {Array.from({ length: NUM_COURTS }).map((_, i) => (
                <option key={i} value={i}>
                  Court {i + 1}
                </option>
              ))}
            </select>
            <button
              onClick={addToQueue}
              className="rounded-xl border px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
            >
              Add to Queue
            </button>
            <div className="flex items-center justify-end">
              <button onClick={resetAll} className="rounded-xl border px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50">
                Reset All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:max-w-[28rem]">
            <label className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm shadow-sm">
              <span>Minutes per game</span>
              <input
                type="number"
                min={1}
                max={60}
                defaultValue={DEFAULT_GAME_MINUTES}
                onChange={(e) => {
                  const mins = Math.max(1, Math.min(60, parseInt(e.target.value) || DEFAULT_GAME_MINUTES));
                  setCourts((prev) => prev.map((c) => ({
                    ...c,
                    totalSeconds: mins * 60,
                    remainingSec: c.running ? c.remainingSec : mins * 60,
                  })));
                }}
                className="ml-3 w-20 rounded-lg border px-2 py-1 text-right"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm shadow-sm">
              <span>Players per court</span>
              <input
                type="number"
                min={1}
                max={8}
                defaultValue={PLAYERS_PER_COURT}
                onChange={(e) => {
                  // Soft update only used when starting/rotating; constant value defined above
                  alert("To permanently change this, edit PLAYERS_PER_COURT in the code.");
                }}
                className="ml-3 w-20 rounded-lg border px-2 py-1 text-right"
              />
            </label>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {courts.map((court, i) => (
            <CourtCard
              key={i}
              index={i}
              court={court}
              onStart={startTimer}
              onEnd={endTimer}
              onNext={nextGame}
              onDeleteFromQueue={removeFromQueue}
              onShuffleQueue={shuffleQueue}
              onClearCurrent={clearCurrent}
            />
          ))}
        </main>

        <footer className="mt-6 text-center text-xs text-gray-500">
          Tip: Click “Next Game” to rotate in the next group when the timer ends or anytime.
        </footer>
      </div>
    </div>
  );
}
