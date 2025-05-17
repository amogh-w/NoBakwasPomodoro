import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
import '../styles/mocha-calendar.css';
import { format } from 'date-fns';
import SessionListByDate from './SessionListByDate';

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
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    };
    fetchSessions();
  }, []);

  return (
    <div className="bg-ctp-surface0 p-6 rounded-xl shadow-md mx-auto">
      <h3 className="text-2xl font-semibold mb-6 text-ctp-text border-b border-ctp-overlay2 pb-2">
        Previous Sessions
      </h3>

      <Calendar
        onClickDay={(value) => {
          const dateKey = format(value, 'yyyy-MM-dd');
          setSelectedDate(dateKey);
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
        <div className="mt-6">
          <SessionListByDate date={selectedDate} sessions={groupedSessions[selectedDate] || []} />
        </div>
      )}
    </div>
  );
};

export default SessionHistory;