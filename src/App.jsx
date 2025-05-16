import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import "./App.css"
import Login from './components/Login';
import Timer from './components/Timer';
import SessionHistory from './components/SessionHistory';

const App = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <Login />;

  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-800">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-600">NoBakwas Pomodoro</h1>
        <button
          onClick={() => auth.signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>
      <main className="space-y-8">
        <Timer />
        <SessionHistory />
      </main>
    </div>
  );
};

export default App;