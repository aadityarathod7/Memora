import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, PenLine, MessageCircle, Lock, Sparkles, LogIn, Feather, Star, BookMarked } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: 'var(--bg-cream)' }}>
      <div className="text-center max-w-2xl">
        {/* Decorative book illustration */}
        <div className="mb-10 relative">
          {/* Book with spine effect */}
          <div className="flex items-center justify-center">
            <div className="w-4 h-32 book-spine rounded-l-md"></div>
            <div className="w-28 h-32 rounded-r-lg shadow-xl flex items-center justify-center relative" style={{ background: 'var(--bg-paper)' }}>
              {/* Gold bookmark */}
              <div className="absolute -top-2 right-4 w-4 h-12 rounded-b-sm" style={{ background: 'linear-gradient(180deg, var(--gold-accent) 0%, #B8994F 100%)' }}>
                <div className="absolute bottom-0 left-0 right-0 h-3" style={{ background: 'inherit', clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}></div>
              </div>
              <BookMarked size={40} style={{ color: 'var(--app-accent)' }} strokeWidth={1.5} />
              {/* Page lines effect */}
              <div className="absolute right-0 top-2 bottom-2 w-1 flex flex-col justify-center gap-0.5">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="h-px w-full" style={{ background: 'rgba(0,0,0,0.05)' }}></div>
                ))}
              </div>
            </div>
          </div>
          {/* Floating sparkles */}
          <div className="absolute -top-2 -right-4 animate-float" style={{ animationDelay: '0.5s' }}>
            <Sparkles size={20} style={{ color: 'var(--gold-accent)' }} />
          </div>
          <div className="absolute -bottom-2 -left-4 animate-float" style={{ animationDelay: '1s' }}>
            <Star size={16} style={{ color: 'var(--gold-accent)' }} />
          </div>
        </div>

        {/* Title with ornate styling */}
        <div className="chapter-divider mb-6">
          <Feather size={16} style={{ color: 'var(--gold-accent)' }} />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif mb-4 tracking-wide font-semibold" style={{ color: 'var(--text-primary)' }}>
          Memora
        </h1>

        <p className="text-lg sm:text-xl mb-4 leading-relaxed font-serif italic" style={{ color: 'var(--text-secondary)' }}>
          "Where memories talk back..."
        </p>

        <div className="chapter-divider mb-6">
          <Star size={10} style={{ color: 'var(--gold-accent)' }} />
        </div>

        <p className="text-base sm:text-lg mb-10 leading-relaxed max-w-md mx-auto px-4" style={{ color: 'var(--text-muted)', fontFamily: "'EB Garamond', Georgia, serif" }}>
          A living journal that listens, remembers, and responds like a human.
          Share your thoughts, feelings, and moments — Memora is always here for you.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          {user ? (
            <Link
              to="/journal"
              className="px-6 py-3 sm:px-8 sm:py-4 btn-accent text-white rounded-xl font-medium shadow-lg text-base sm:text-lg flex items-center gap-2 sm:gap-3"
            >
              <Feather size={22} />
              Open My Journal
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="px-6 py-3 sm:px-8 sm:py-4 btn-accent text-white rounded-xl font-medium shadow-lg text-base sm:text-lg flex items-center gap-2 sm:gap-3"
              >
                <Feather size={20} className="sm:w-[22px] sm:h-[22px]" />
                Begin Your Story
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-medium transition-all text-base sm:text-lg flex items-center gap-2 hover:shadow-md"
                style={{ color: 'var(--app-accent-dark)', background: 'var(--bg-paper)', border: '1px solid var(--border-light)' }}
              >
                <LogIn size={20} />
                Welcome Back
              </Link>
            </>
          )}
        </div>

        {/* Features - styled like book chapters */}
        <div className="mt-20">
          <div className="chapter-divider mb-8">
            <BookOpen size={16} style={{ color: 'var(--gold-accent)' }} />
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {/* Feature 1 */}
            <div className="journal-entry relative rounded-xl p-6 transform hover:-translate-y-1 transition-all hover:shadow-lg">
              {/* Chapter number */}
              <span className="absolute top-3 right-4 font-serif text-xs italic" style={{ color: 'var(--gold-accent)' }}>Chapter I</span>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'var(--app-accent-light)' }}>
                <PenLine size={24} style={{ color: 'var(--app-accent)' }} />
              </div>
              <p className="font-serif text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Write Freely</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: "'EB Garamond', Georgia, serif" }}>
                Pour your thoughts onto the page. Your journal is your safe space to express everything.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="journal-entry relative rounded-xl p-6 transform hover:-translate-y-1 transition-all hover:shadow-lg">
              <span className="absolute top-3 right-4 font-serif text-xs italic" style={{ color: 'var(--gold-accent)' }}>Chapter II</span>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'var(--app-accent-light)' }}>
                <MessageCircle size={24} style={{ color: 'var(--app-accent)' }} />
              </div>
              <p className="font-serif text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Be Heard</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: "'EB Garamond', Georgia, serif" }}>
                Memora reads your words and responds like a friend who truly understands you.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="journal-entry relative rounded-xl p-6 transform hover:-translate-y-1 transition-all hover:shadow-lg">
              <span className="absolute top-3 right-4 font-serif text-xs italic" style={{ color: 'var(--gold-accent)' }}>Chapter III</span>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'var(--app-accent-light)' }}>
                <Lock size={24} style={{ color: 'var(--app-accent)' }} />
              </div>
              <p className="font-serif text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Stay Private</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: "'EB Garamond', Georgia, serif" }}>
                Your memories are precious and personal. They remain safe and secure, always.
              </p>
            </div>
          </div>
        </div>

        {/* Footer ornament */}
        <div className="mt-16">
          <div className="chapter-divider">
            <Star size={12} style={{ color: 'var(--gold-accent)' }} />
          </div>
          <p className="mt-4 text-sm italic font-serif" style={{ color: 'var(--text-muted)' }}>
            Every memory deserves to be remembered.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
