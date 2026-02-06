import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Journal from './pages/Journal';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-warm-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/journal" element={<Journal />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
