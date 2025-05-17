import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
import '../styles/mocha-calendar.css';
import { format } from 'date-fns';

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [groupedSessions, setGroupedSessions] = useState({});

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
      const grouped = data.reduce((acc, session) => {
        const date = format(new Date(session.start), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(session);
        return acc;
      }, {});
      setGroupedSessions(grouped);
    };
    fetchSessions();
  }, []);

  return (
    <div className="bg-ctp-surface0 p-6 rounded-xl shadow-md max-w-xl mx-auto">
      <h3 className="text-2xl font-semibold mb-6 text-ctp-text border-b border-ctp-overlay2 pb-2">
        Previous Sessions
      </h3>

      <Calendar
        onClickDay={(value) => {
          const dateKey = format(value, 'yyyy-MM-dd');
          if (groupedSessions[dateKey]) {
            setSelectedDate(dateKey);
          }
        }}
        tileContent={({ date }) => {
          const key = format(date, 'yyyy-MM-dd');
          return groupedSessions[key] ? (
            <div className="w-2 h-2 bg-ctp-peach rounded-full mx-auto mt-1" />
          ) : null;
        }}
        tileClassName={({ date }) => {
          const key = format(date, 'yyyy-MM-dd');
          return groupedSessions[key] ? 'bg-ctp-surface1 text-ctp-text' : '';
        }}
        className="mb-6"
      />

      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-ctp-base p-6 rounded-xl shadow-lg max-w-md w-full relative">
            <button
              onClick={() => setSelectedDate(null)}
              className="absolute top-2 right-2 text-ctp-subtext1"
            >
              ✕
            </button>
            <h4 className="text-xl font-bold mb-4 text-ctp-lavender">
              Sessions on {selectedDate}
            </h4>
            <ul className="space-y-3 max-h-60 overflow-y-auto">
              {groupedSessions[selectedDate].map((session) => (
                <li key={session.id} className="border border-ctp-overlay2 p-3 rounded-lg bg-ctp-surface0">
                  <p className="font-semibold text-ctp-peach">{session.activity}</p>
                  <p className="text-sm text-ctp-subtext1 leading-relaxed whitespace-pre-line">
                    Start: {new Date(session.start).toLocaleTimeString()}{"\n"}
                    End: {new Date(session.end).toLocaleTimeString()}{"\n"}
                    Duration: {Math.floor(session.duration / 60)} min {session.duration % 60} sec
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;