import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';

const Login = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h2 className="text-4xl font-bold mb-8 text-ctp-text">
        Welcome to No Bakwas Pomodoro
      </h2>
      <button
        onClick={handleLogin}
        className="
          bg-ctp-pink 
          text-ctp-crust 
          px-8 py-3 
          rounded-lg 
          shadow-lg 
          hover:shadow-2xl 
          hover:scale-105 
          transition 
          duration-300 
          ease-in-out 
          focus:outline-none 
          focus:ring-4 
          focus:ring-ctp-mauve/70
          active:scale-95
        "
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;