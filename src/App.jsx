import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { useState, useEffect } from 'react';
import "./App.css"
import Login from './components/Login';
import Timer from './components/Timer';
import SessionHistory from './components/SessionHistory';

const themes = ["latte", "frappe", "macchiato", "mocha"];

const ThemeToggler = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "latte";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    themes.forEach(t => document.body.classList.remove(t));
    document.body.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <button
      onClick={toggleTheme}
      className="bg-ctp-pink text-white px-4 py-2 rounded hover:bg-ctp-mauve transition-colors ml-4"
      aria-label="Toggle Theme"
    >
      {theme.charAt(0).toUpperCase() + theme.slice(1)}
    </button>
  );
};

const App = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) 
    return <p className="text-center mt-10 text-ctp-subtext0">Loading...</p>;

  if (!user) 
    return <Login />;

  return (
    <div className="max-w-6xl mx-auto px-8 py-6 text-ctp-text min-h-screen">
      <header className="flex justify-between items-center mb-8 border-b border-ctp-overlay2 pb-4">
        <h1 className="text-3xl font-bold text-ctp-pink">No Bakwas Pomodoro</h1>
        <div className="flex items-center">
          <button
            onClick={() => auth.signOut()}
            className="bg-ctp-red text-white px-4 py-2 rounded hover:bg-ctp-maroon transition-colors"
          >
            Logout
          </button>
          <ThemeToggler />
        </div>
      </header>
      <main className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <Timer />
        </div>
        <div className="w-full md:w-2/3">
          <SessionHistory />
        </div>
      </main>
    </div>
  );
};

export default App;