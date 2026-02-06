import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Book Icon */}
        <div className="mb-8">
          <svg className="w-24 h-24 mx-auto text-warm-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            <line x1="8" y1="6" x2="16" y2="6"></line>
            <line x1="8" y1="10" x2="16" y2="10"></line>
            <line x1="8" y1="14" x2="12" y2="14"></line>
          </svg>
        </div>

        <h1 className="text-5xl font-serif text-warm-800 mb-4">
          Book Companion
        </h1>

        <p className="text-xl text-warm-600 mb-8 leading-relaxed">
          Your personal journal that listens, understands, and responds like a caring friend.
          Share your thoughts, feelings, and daily moments.
        </p>

        <div className="flex gap-4 justify-center">
          {user ? (
            <Link
              to="/journal"
              className="px-8 py-3 bg-warm-500 text-white rounded-lg font-medium hover:bg-warm-600 transition-colors shadow-soft"
            >
              Open My Journal
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-8 py-3 bg-warm-500 text-white rounded-lg font-medium hover:bg-warm-600 transition-colors shadow-soft"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-8 py-3 bg-cream-100 text-warm-700 rounded-lg font-medium hover:bg-cream-200 transition-colors border border-warm-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-white/60 p-6 rounded-xl shadow-soft">
            <div className="text-3xl mb-3">&#128214;</div>
            <h3 className="font-serif text-lg text-warm-800 mb-2">Write Freely</h3>
            <p className="text-warm-600 text-sm">Express your thoughts, feelings, and daily experiences in a safe space.</p>
          </div>
          <div className="bg-white/60 p-6 rounded-xl shadow-soft">
            <div className="text-3xl mb-3">&#128172;</div>
            <h3 className="font-serif text-lg text-warm-800 mb-2">Get Support</h3>
            <p className="text-warm-600 text-sm">Receive warm, empathetic responses that understand and validate your feelings.</p>
          </div>
          <div className="bg-white/60 p-6 rounded-xl shadow-soft">
            <div className="text-3xl mb-3">&#128274;</div>
            <h3 className="font-serif text-lg text-warm-800 mb-2">Stay Private</h3>
            <p className="text-warm-600 text-sm">Your entries are securely stored and only accessible to you.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
