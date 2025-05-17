import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FiEdit, FiTrash2, FiSave, FiX } from 'react-icons/fi';

const SessionListByDate = ({ date, sessions, refreshSessions }) => {
  const [editId, setEditId] = useState(null);
  const [editActivity, setEditActivity] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editDuration, setEditDuration] = useState({ minutes: 0, seconds: 0 });

  const parseTimeToDate = (timeStr) => {
    // Returns a Date object with today's date and given time string "HH:mm"
    const [hours, minutes] = timeStr.split(':').map(Number);
    const dateObj = new Date();
    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj;
  };

  const formatDateToTimeString = (dateObj) => {
    const h = dateObj.getHours().toString().padStart(2, '0');
    const m = dateObj.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const updateDurationFromTimes = (start, end) => {
    const diffSeconds = Math.floor((end - start) / 1000);
    return {
      minutes: Math.floor(diffSeconds / 60),
      seconds: diffSeconds % 60,
    };
  };

  const updateEndFromDuration = (start, duration) => {
    const newEnd = new Date(start.getTime() + (duration.minutes * 60 + duration.seconds) * 1000);
    return newEnd;
  };

  const startEdit = (session) => {
    setEditId(session.id);
    setEditActivity(session.activity);

    const startDate = new Date(session.start);
    const endDate = new Date(session.end);

    setEditStartTime(formatDateToTimeString(startDate));
    setEditEndTime(formatDateToTimeString(endDate));

    setEditDuration(updateDurationFromTimes(startDate, endDate));
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditActivity('');
    setEditStartTime('');
    setEditEndTime('');
    setEditDuration({ minutes: 0, seconds: 0 });
  };

  const saveEdit = async (id) => {
    if (!editActivity.trim()) {
      alert('Activity name cannot be empty');
      return;
    }
    if (!editStartTime || !editEndTime) {
      alert('Start and end time must be set');
      return;
    }
    const startDate = parseTimeToDate(editStartTime);
    const endDate = parseTimeToDate(editEndTime);

    if (endDate <= startDate) {
      alert('End time must be after start time');
      return;
    }

    await updateDoc(doc(db, 'sessions', id), {
      activity: editActivity,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      duration: Math.floor((endDate - startDate) / 1000),
    });

    cancelEdit();
    refreshSessions();
  };

  // Update end time when duration changes
  const handleDurationChange = (field, value) => {
    let newDuration = { ...editDuration };
    newDuration[field] = Math.min(Math.max(Number(value), 0), field === 'minutes' ? 999 : 59); // limit seconds to 59

    setEditDuration(newDuration);

    if (editStartTime) {
      const startDate = parseTimeToDate(editStartTime);
      const newEnd = updateEndFromDuration(startDate, newDuration);
      setEditEndTime(formatDateToTimeString(newEnd));
    }
  };

  // Update duration when start or end times change
const handleTimeChange = (field, value) => {
  if (field === 'start') {
    setEditStartTime(value);
    if (editEndTime) {
      const startDate = parseTimeToDate(value); // use new start time
      const endDate = parseTimeToDate(editEndTime);
      if (endDate > startDate) {
        setEditDuration(updateDurationFromTimes(startDate, endDate));
      }
    }
  } else if (field === 'end') {
    setEditEndTime(value);
    if (editStartTime) {
      const startDate = parseTimeToDate(editStartTime);
      const endDate = parseTimeToDate(value); // use new end time
      if (endDate > startDate) {
        setEditDuration(updateDurationFromTimes(startDate, endDate));
      }
    }
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    await deleteDoc(doc(db, 'sessions', id));
    refreshSessions();
  };

  return (
    <div className="bg-ctp-surface1 p-6 rounded-xl shadow-lg">
      <h4 className="text-xl font-bold mb-4 text-ctp-lavender">
        Sessions on {date}
      </h4>

      {sessions.length === 0 ? (
        <p className="text-ctp-subtext0">No sessions recorded for this day.</p>
      ) : (
        <ul className="space-y-3 max-h-96 overflow-y-auto">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="border border-ctp-overlay2 p-3 rounded-lg bg-ctp-surface0 flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div className="flex-1">
                {editId === session.id ? (
                  <>
                    <input
                      type="text"
                      className="w-full p-2 rounded border border-ctp-overlay2 bg-ctp-base text-ctp-text focus:outline-none focus:ring-2 focus:ring-ctp-pink mb-2"
                      value={editActivity}
                      onChange={(e) => setEditActivity(e.target.value)}
                    />
                    <div className="flex space-x-2 mb-2">
                      <div>
                        <label className="block text-sm mb-1">Start Time</label>
                        <input
                          type="time"
                          className="rounded border border-ctp-overlay2 bg-ctp-base text-ctp-text p-2 focus:outline-none focus:ring-2 focus:ring-ctp-pink"
                          value={editStartTime}
                          onChange={(e) => handleTimeChange('start', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">End Time</label>
                        <input
                          type="time"
                          className="rounded border border-ctp-overlay2 bg-ctp-base text-ctp-text p-2 focus:outline-none focus:ring-2 focus:ring-ctp-pink"
                          value={editEndTime}
                          onChange={(e) => handleTimeChange('end', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Duration</label>
                        <div className="flex space-x-1">
                          <input
                            type="number"
                            min="0"
                            className="w-14 rounded border border-ctp-overlay2 bg-ctp-base text-ctp-text p-2 focus:outline-none focus:ring-2 focus:ring-ctp-pink"
                            value={editDuration.minutes}
                            onChange={(e) => handleDurationChange('minutes', e.target.value)}
                          />
                          <span className="text-ctp-subtext0 select-none">min</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            className="w-14 rounded border border-ctp-overlay2 bg-ctp-base text-ctp-text p-2 focus:outline-none focus:ring-2 focus:ring-ctp-pink"
                            value={editDuration.seconds}
                            onChange={(e) => handleDurationChange('seconds', e.target.value)}
                          />
                          <span className="text-ctp-subtext0 select-none">sec</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-ctp-peach mb-1">{session.activity}</p>
                    <p className="text-sm text-ctp-subtext1 leading-relaxed whitespace-pre-line">
                      Start: {new Date(session.start).toLocaleTimeString()}
                      {"\n"}
                      End: {new Date(session.end).toLocaleTimeString()}
                      {"\n"}
                      Duration: {Math.floor(session.duration / 60)} min {session.duration % 60} sec
                    </p>
                  </>
                )}
              </div>

              <div className="mt-3 md:mt-0 md:ml-4 flex space-x-3">
                {editId === session.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(session.id)}
                      aria-label="Save session"
                      title="Save"
                      className="text-ctp-green hover:text-ctp-green/90 transition p-1 rounded"
                    >
                      <FiSave size={22} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      aria-label="Cancel editing"
                      title="Cancel"
                      className="text-ctp-red hover:text-ctp-maroon transition p-1 rounded"
                    >
                      <FiX size={22} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(session)}
                      aria-label="Edit session"
                      title="Edit"
                      className="text-ctp-blue hover:text-ctp-sapphire transition p-1 rounded"
                    >
                      <FiEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      aria-label="Delete session"
                      title="Delete"
                      className="text-ctp-red hover:text-ctp-maroon transition p-1 rounded"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SessionListByDate;