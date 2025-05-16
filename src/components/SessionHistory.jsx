import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      const q = query(
        collection(db, 'sessions'),
        where('uid', '==', auth.currentUser.uid),
        orderBy('start', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessions(data);
    };
    fetchSessions();
  }, []);

  return (
    <div className="bg-ctp-surface0 p-6 rounded-xl shadow-md max-w-xl mx-auto">
      <h3 className="text-2xl font-semibold mb-6 text-ctp-text border-b border-ctp-overlay2 pb-2">
        Previous Sessions
      </h3>
      <ul className="space-y-4">
        {sessions.length === 0 ? (
          <li className="text-ctp-subtext0 italic">No sessions found.</li>
        ) : (
          sessions.map(session => (
            <li
              key={session.id}
              className="border border-ctp-overlay2 p-4 rounded-lg bg-ctp-base shadow-inner"
            >
              <p className="font-semibold text-ctp-peach mb-1">{session.activity}</p>
              <p className="text-sm text-ctp-subtext1 leading-relaxed whitespace-pre-line">
                Start: {new Date(session.start).toLocaleString()}{"\n"}
                End: {new Date(session.end).toLocaleString()}{"\n"}
                Duration: {Math.floor(session.duration / 60)} min {session.duration % 60} sec
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default SessionHistory;