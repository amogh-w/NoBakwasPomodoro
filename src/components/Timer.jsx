import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const Timer = () => {
  const [secondsLeft, setSecondsLeft] = useState(1500); // 25 min
  const [isRunning, setIsRunning] = useState(false);
  const [activity, setActivity] = useState('');
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    let timer;
    if (isRunning && secondsLeft > 0) {
      timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    } else if (secondsLeft === 0 && isRunning) {
      handleSessionComplete();
    }
    return () => clearTimeout(timer);
  }, [secondsLeft, isRunning]);

  const handleStart = () => {
    if (!activity.trim()) return;
    setIsRunning(true);
    setStartTime(new Date());
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(1500);
    setStartTime(null);
    setActivity('');
  };

  const saveSession = async (endTime) => {
    const duration = Math.floor((endTime - startTime) / 1000);
    if (!activity.trim() || !startTime || duration <= 0) return;

    await addDoc(collection(db, 'sessions'), {
      uid: auth.currentUser.uid,
      activity,
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      duration
    });
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    const endTime = new Date();
    await saveSession(endTime);
    setSecondsLeft(1500);
    setStartTime(null);
    setActivity('');
  };

  const handleEndSession = async () => {
    if (!isRunning) return;
    setIsRunning(false);
    const endTime = new Date();
    await saveSession(endTime);
    setSecondsLeft(1500);
    setStartTime(null);
    setActivity('');
  };

  const formatTime = () => {
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const s = (secondsLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <input
        value={activity}
        onChange={e => setActivity(e.target.value)}
        className="border p-2 rounded w-full mb-4"
        placeholder="What are you working on?"
        disabled={isRunning}
      />
      <h2 className="text-4xl font-mono text-center mb-4">{formatTime()}</h2>
      <div className="flex justify-center space-x-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Start
          </button>
        ) : (
          <>
            <button
              onClick={handleEndSession}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              End Session
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Timer;