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
    <div className="bg-white p-6 rounded shadow-md">
      <h3 className="text-xl font-semibold mb-4">Previous Sessions</h3>
      <ul className="space-y-2">
        {sessions.map(session => (
          <li key={session.id} className="border p-3 rounded">
            <p className="font-semibold">{session.activity}</p>
            <p className="text-sm text-gray-500">
              Start: {new Date(session.start).toLocaleString()}<br />
              End: {new Date(session.end).toLocaleString()}<br />
              Duration: {Math.floor(session.duration / 60)} min {session.duration % 60} sec
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionHistory;