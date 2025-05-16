import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import "./App.css"
import Login from './components/Login';
import Timer from './components/Timer';
import SessionHistory from './components/SessionHistory';

const App = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) 
    return <p className="text-center mt-10 text-ctp-subtext0">Loading...</p>;

  if (!user) 
    return <Login />;

  return (
    <div className="max-w-3xl mx-auto p-6 text-ctp-text min-h-screen">
      <header className="flex justify-between items-center mb-8 border-b border-ctp-overlay2 pb-4">
        <h1 className="text-3xl font-bold text-ctp-pink">No Bakwas Pomodoro</h1>
        <button
          onClick={() => auth.signOut()}
          className="bg-ctp-red text-white px-4 py-2 rounded hover:bg-ctp-maroon transition-colors"
        >
          Logout
        </button>
      </header>
      <main className="space-y-10">
        <Timer />
        <SessionHistory />
      </main>
    </div>
  );
};

export default App;