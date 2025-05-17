import React from 'react';

const SessionListByDate = ({ date, sessions }) => {
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
              className="border border-ctp-overlay2 p-3 rounded-lg bg-ctp-surface0"
            >
              <p className="font-semibold text-ctp-peach">{session.activity}</p>
              <p className="text-sm text-ctp-subtext1 leading-relaxed whitespace-pre-line">
                Start: {new Date(session.start).toLocaleTimeString()}
                {"\n"}
                End: {new Date(session.end).toLocaleTimeString()}
                {"\n"}
                Duration: {Math.floor(session.duration / 60)} min {session.duration % 60} sec
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SessionListByDate;