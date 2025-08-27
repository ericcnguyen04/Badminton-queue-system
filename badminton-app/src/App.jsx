import React, { useState, useEffect } from 'react';

const BadmintonQueueApp = () => {
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [courts, setCourts] = useState({
    door: {
      currentPlayers: [],
      queue: [],
      timer: 900, // 15 minutes in seconds
      isActive: false,
      isRunning: false
    },
    middle: {
      currentPlayers: [],
      queue: [],
      timer: 900,
      isActive: false,
      isRunning: false
    },
    far: {
      currentPlayers: [],
      queue: [],
      timer: 900,
      isActive: false,
      isRunning: false
    }
  });
  
  const [editingQueue, setEditingQueue] = useState({ court: null, index: null, value: '' });

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCourts(prevCourts => {
        const newCourts = { ...prevCourts };
        
        Object.keys(newCourts).forEach(courtName => {
          const court = newCourts[courtName];
          if (court.isRunning && court.timer > 0) {
            court.timer -= 1;
          } else if (court.isRunning && court.timer === 0) {
            // Auto-end session when timer reaches 0
            court.isRunning = false;
            court.isActive = false;
            court.currentPlayers = [];
            court.timer = 900;
            
            // Move next group from queue to court if available
            if (court.queue.length > 0) {
              const nextGroup = court.queue.shift();
              court.currentPlayers = nextGroup;
              court.isActive = true;
            }
          }
        });
        
        return newCourts;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNameChange = (index, value) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const addToQueue = (courtName) => {
    const filledNames = playerNames.filter(name => name.trim() !== '');
    if (filledNames.length === 0) {
      alert('Please enter at least one player name');
      return;
    }

    setCourts(prev => ({
      ...prev,
      [courtName]: {
        ...prev[courtName],
        queue: [...prev[courtName].queue, filledNames]
      }
    }));

    // Clear the input names
    setPlayerNames(['', '', '', '']);
  };

  const startTimer = (courtName) => {
    setCourts(prev => {
      const court = prev[courtName];
      
      // If no one is currently playing and there's a queue, start with first group
      if (!court.isActive && court.queue.length > 0) {
        const nextGroup = [...court.queue];
        const currentGroup = nextGroup.shift();
        
        return {
          ...prev,
          [courtName]: {
            ...court,
            currentPlayers: currentGroup,
            queue: nextGroup,
            isActive: true,
            isRunning: true,
            timer: court.timer === 0 ? 900 : court.timer
          }
        };
      }
      
      // If there are current players, just start/resume the timer
      if (court.isActive) {
        return {
          ...prev,
          [courtName]: {
            ...court,
            isRunning: true,
            timer: court.timer === 0 ? 900 : court.timer
          }
        };
      }
      
      return prev;
    });
  };

  const pauseTimer = (courtName) => {
    setCourts(prev => ({
      ...prev,
      [courtName]: {
        ...prev[courtName],
        isRunning: false
      }
    }));
  };

  const endSession = (courtName) => {
    setCourts(prev => {
      const court = prev[courtName];
      const nextGroup = court.queue.length > 0 ? [...court.queue] : [];
      const newCurrentPlayers = nextGroup.length > 0 ? nextGroup.shift() : [];
      
      return {
        ...prev,
        [courtName]: {
          ...court,
          currentPlayers: newCurrentPlayers,
          queue: nextGroup,
          isActive: newCurrentPlayers.length > 0,
          isRunning: false,
          timer: 900
        }
      };
    });
  };

  const resetTimer = (courtName) => {
    setCourts(prev => ({
      ...prev,
      [courtName]: {
        ...prev[courtName],
        timer: 900,
        isRunning: false
      }
    }));
  };

  const deleteFromQueue = (courtName, index) => {
    setCourts(prev => ({
      ...prev,
      [courtName]: {
        ...prev[courtName],
        queue: prev[courtName].queue.filter((_, i) => i !== index)
      }
    }));
  };

  const startEditQueue = (courtName, index, currentValue) => {
    setEditingQueue({
      court: courtName,
      index: index,
      value: currentValue.join(', ')
    });
  };

  const saveEditQueue = () => {
    if (editingQueue.court && editingQueue.index !== null) {
      const newNames = editingQueue.value.split(',').map(name => name.trim()).filter(name => name !== '');
      setCourts(prev => {
        const newQueue = [...prev[editingQueue.court].queue];
        newQueue[editingQueue.index] = newNames;
        return {
          ...prev,
          [editingQueue.court]: {
            ...prev[editingQueue.court],
            queue: newQueue
          }
        };
      });
    }
    setEditingQueue({ court: null, index: null, value: '' });
  };

  const cancelEditQueue = () => {
    setEditingQueue({ court: null, index: null, value: '' });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (seconds) => {
    if (seconds > 600) return 'text-green-600'; // > 10 minutes
    if (seconds > 300) return 'text-yellow-600'; // > 5 minutes
    return 'text-red-600'; // <= 5 minutes
  };

  const CourtModule = ({ courtName, court, displayName }) => (
    <div className="bg-white rounded-lg shadow-lg p-8 min-h-96">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{displayName}</h2>
      
      {/* Timer Circle */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={court.isRunning ? "#3b82f6" : "#6b7280"}
              strokeWidth="8"
              strokeDasharray={`${(court.timer / 900) * 283} 283`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${getTimerColor(court.timer)}`}>
              {formatTime(court.timer)}
            </span>
          </div>
        </div>
      </div>

      {/* Current Players */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
          Currently Playing:
        </h3>
        <div className="bg-blue-50 rounded p-3 min-h-12">
          {court.currentPlayers.length > 0 ? (
            <div className="text-blue-800 font-medium">
              {court.currentPlayers.length <= 2 
                ? court.currentPlayers.join(' & ')
                : `${court.currentPlayers.slice(0, 2).join(' & ')} vs ${court.currentPlayers.slice(2).join(' & ')}`
              }
            </div>
          ) : (
            <div className="text-gray-500 italic">No players on court</div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => court.isRunning ? pauseTimer(courtName) : startTimer(courtName)}
          className={`flex items-center px-3 py-2 rounded text-white font-medium ${
            court.isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {court.isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button
          onClick={() => endSession(courtName)}
          className="flex items-center px-3 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600"
        >
          End
        </button>
        
        <button
          onClick={() => resetTimer(courtName)}
          className="flex items-center px-3 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600"
        >
          Reset
        </button>
      </div>

      {/* Queue */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Queue ({court.queue.length})</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {court.queue.length === 0 ? (
            <div className="text-gray-500 italic p-2">No one in queue</div>
          ) : (
            court.queue.map((group, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                {editingQueue.court === courtName && editingQueue.index === index ? (
                  <div className="flex-1 flex gap-2 min-w-0">
                    <input
                      type="text"
                      value={editingQueue.value}
                      onChange={(e) => setEditingQueue({...editingQueue, value: e.target.value})}
                      className="flex-1 px-2 py-1 border rounded min-w-0"
                      placeholder="Name1, Name2, Name3, Name4"
                    />
                    <button
                      onClick={saveEditQueue}
                      className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditQueue}
                      className="px-2 py-1 bg-gray-500 text-white rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-gray-800 font-medium">
                      {index + 1}. {group.length <= 2 
                        ? group.join(' & ')
                        : `${group.slice(0, 2).join(' & ')} vs ${group.slice(2).join(' & ')}`
                      }
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditQueue(courtName, index, group)}
                        className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteFromQueue(courtName, index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white border rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Badminton Club Queue System
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Input */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Enter Player Names</h2>
              <div className="grid grid-cols-2 gap-2">
                {playerNames.map((name, index) => (
                  <input
                    key={index}
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder={`Player ${index + 1}`}
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>
            </div>

            {/* Court Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Add to Court Queue</h2>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => addToQueue('door')}
                  className="px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition-colors"
                >
                  Add to Court Door Queue
                </button>
                <button
                  onClick={() => addToQueue('middle')}
                  className="px-4 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600 transition-colors"
                >
                  Add to Court Middle Queue
                </button>
                <button
                  onClick={() => addToQueue('far')}
                  className="px-4 py-2 bg-purple-500 text-white rounded font-medium hover:bg-purple-600 transition-colors"
                >
                  Add to Court Far Queue
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Court Modules */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <CourtModule
            courtName="door"
            court={courts.door}
            displayName="Court Door"
          />
          <CourtModule
            courtName="middle"
            court={courts.middle}
            displayName="Court Middle"
          />
          <CourtModule
            courtName="far"
            court={courts.far}
            displayName="Court Far"
          />
        </div>
      </div>
    </div>
  );
};

export default BadmintonQueueApp;