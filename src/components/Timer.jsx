import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

// Pomodoro durations in seconds (default)
const DURATIONS = {
  work: 1500,       // 25 min
  shortBreak: 300,  // 5 min
  longBreak: 900,   // 15 min
};

const LONG_BREAK_INTERVAL = 4; // After 4 work sessions

const Timer = () => {
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false); // boolean, if task is running or not
  const [isPaused, setIsPaused] = useState(false);
  const [activity, setActivity] = useState(''); // task name
  const [startTime, setStartTime] = useState(null);
  const [sessionType, setSessionType] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0);
  const [customDurations, setCustomDurations] = useState(DURATIONS);

  const audioRef = useRef(null);

  // Load saved timer state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pomodoro-timer-state');
    if (saved) {
      const state = JSON.parse(saved);
      setSecondsLeft(state.secondsLeft);
      setIsRunning(state.isRunning);
      setIsPaused(state.isPaused);
      setActivity(state.activity);
      setStartTime(state.startTime ? new Date(state.startTime) : null);
      setSessionType(state.sessionType);
      setCompletedWorkSessions(state.completedWorkSessions);
      setCustomDurations(state.customDurations || DURATIONS);
    }
  }, []);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      'pomodoro-timer-state',
      JSON.stringify({
        secondsLeft,
        isRunning,
        isPaused,
        activity,
        startTime,
        sessionType,
        completedWorkSessions,
        customDurations,
      })
    );
  }, [secondsLeft, isRunning, isPaused, activity, startTime, sessionType, completedWorkSessions, customDurations]);

  // Timer countdown effect
  useEffect(() => {
    if (!isRunning || isPaused) return;

    if (secondsLeft === 0) {
      playSound();
      handleSessionComplete();
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft(secondsLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, isRunning, isPaused]);

  // Keyboard shortcut (Space) to start/pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRunning && activity.trim()) {
          handleStart();
        } else if (isRunning) {
          setIsPaused((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, activity]);

  const playSound = () => {
    if (audioRef.current) audioRef.current.play();
  };

  const resetTimerByType = (type) => {
    setSecondsLeft(customDurations[type]);
    setSessionType(type);
    setIsPaused(false);
  };

  const handleStart = () => {
    if (!activity.trim()) return;
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(new Date());
  };

  const handlePause = () => setIsPaused(true);

  const handleResume = () => setIsPaused(false);

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    resetTimerByType('work');
    setStartTime(null);
    setActivity('');
    setCompletedWorkSessions(0);
  };

  // Save session info to Firestore
  const saveSession = async (endTime) => {
    const duration = Math.floor((endTime - startTime) / 1000);
    if (!activity.trim() || !startTime || duration <= 0) return;

    await addDoc(collection(db, 'sessions'), {
      uid: auth.currentUser.uid,
      activity,
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      duration,
      sessionType,
    });
  };

  // Called when a session finishes naturally
  const handleSessionComplete = async () => {
    setIsRunning(false);
    setIsPaused(false);
    const endTime = new Date();
    await saveSession(endTime);

    if (sessionType === 'work') {
      const newCompleted = completedWorkSessions + 1;
      setCompletedWorkSessions(newCompleted);
      // Decide next session: long break or short break
      if (newCompleted % LONG_BREAK_INTERVAL === 0) {
        setSessionType('longBreak');
        setSecondsLeft(customDurations.longBreak);
        setIsRunning(true);
        setStartTime(new Date());
      } else {
        setSessionType('shortBreak');
        setSecondsLeft(customDurations.shortBreak);
        setIsRunning(true);
        setStartTime(new Date());
      }
    } else {
      setSessionType('work');
      setSecondsLeft(customDurations.work);
      setIsRunning(true);
      setStartTime(new Date());
    }
    // setActivity(''); // Do not clear activity here to preserve task name
  };

  // Called when user manually ends session
  const handleEndSession = async () => {
    if (!isRunning) return;
    setIsRunning(false);
    setIsPaused(false);
    const endTime = new Date();
    await saveSession(endTime);
    resetTimerByType('work');
    setStartTime(null);
    setActivity('');
  };

  // Format timer as mm:ss
  const formatTime = () => {
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const s = (secondsLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Progress percentage for progress circle
  const progressPercent = 100 - (secondsLeft / customDurations[sessionType]) * 100;

  // Handle custom duration changes
  const handleDurationChange = (type, value) => {
    const val = Math.max(1, Number(value));
    setCustomDurations((prev) => ({
      ...prev,
      [type]: val * 60, // convert minutes to seconds
    }));

    if (sessionType === type && !isRunning) {
      setSecondsLeft(val * 60);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-ctp-surface0 p-6 rounded-xl shadow-md">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      <label className="block mb-2 font-semibold text-ctp-text select-none">What are you working on?</label>
      <input
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
        className="border border-ctp-overlay2 bg-ctp-base text-ctp-text p-2 rounded w-full mb-6 placeholder-ctp-subtext0 disabled:opacity-60"
        placeholder="Describe your task..."
        disabled={isRunning}
      />
      {!activity.trim() && !isRunning && (
        <p className="text-ctp-red mb-4 select-none text-sm font-semibold">
          Please enter an activity to start the timer.
        </p>
      )}

      <h3 className="text-center mb-4 font-semibold text-ctp-text select-none">
        {sessionType === 'work'
          ? 'Focus Time (Work)'
          : sessionType === 'shortBreak'
          ? 'Short Break'
          : 'Long Break'}
      </h3>

      <div className="relative w-60 h-60 mx-auto mb-6">
        <svg className="transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#181825"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={sessionType === 'work' ? '#8ec07c' : '#fabd2f'}
            strokeWidth="10"
            fill="none"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={((100 - progressPercent) / 100) * 2 * Math.PI * 45}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-5xl font-mono text-ctp-text select-none">
          {formatTime()}
        </div>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={!activity.trim()}
            className={`font-semibold px-6 py-2 rounded-lg shadow-md transition ${
              activity.trim()
                ? 'bg-ctp-green text-ctp-crust hover:bg-ctp-green/90'
                : 'bg-ctp-overlay2 text-ctp-subtext0 cursor-not-allowed'
            }`}
          >
            Start
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsPaused((p) => !p)}
              className={`font-semibold px-6 py-2 rounded-lg shadow-md transition ${
                isPaused
                  ? 'bg-ctp-green text-ctp-crust hover:bg-ctp-green/90'
                  : 'bg-ctp-yellow text-ctp-crust hover:bg-ctp-yellow/90'
              }`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleEndSession}
              className="bg-ctp-red text-ctp-crust font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-ctp-maroon transition"
            >
              End Session
            </button>
            <button
              onClick={handleReset}
              className="bg-ctp-overlay2 text-ctp-text font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-ctp-overlay1 transition"
            >
              Reset
            </button>
            <button
              onClick={handleSessionComplete}
              className="bg-ctp-blue text-ctp-crust font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-ctp-sapphire transition"
            >
              Skip
            </button>
          </>
        )}
      </div>

      <div className="border-t border-ctp-overlay2 pt-4 text-sm text-ctp-subtext0 select-none">
        <h4 className="font-semibold mb-2 text-ctp-text">Customize Durations (minutes)</h4>
        <div className="flex justify-between space-x-4">
          {['work', 'shortBreak', 'longBreak'].map((type) => (
            <div key={type} className="flex flex-col items-center">
              <label className="capitalize mb-1">{type.replace(/([A-Z])/g, ' $1')}</label>
              <input
                type="number"
                min={1}
                value={Math.floor(customDurations[type] / 60)}
                onChange={(e) => handleDurationChange(type, e.target.value)}
                className="w-16 text-center rounded border border-ctp-overlay2 bg-ctp-base text-ctp-text p-1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timer;