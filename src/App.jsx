import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar     from './components/Navbar';
import Dashboard  from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Insights   from './pages/Insights';
import Chatbot    from './pages/Chatbot';
import AIAdvisor  from './pages/AIAdvisor';
import Login      from './pages/Login';
import Register   from './pages/Register';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
        <p className="text-sm text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
};

const ChatFAB = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  if (pathname === '/chat') return null;
  return (
    <button
      onClick={() => navigate('/chat')}
      aria-label="Open AI chat"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-95 shadow-xl shadow-indigo-500/30 transition-all duration-200 group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.84L3 20l1.09-3.27A7.96 7.96 0 013 12C3 7.582 7.03 4 12 4s9 3.582 9 8z" />
      </svg>
      <span className="absolute right-16 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 shadow-lg">
        AI Chat
      </span>
    </button>
  );
};

const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50">
    <Navbar />
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    <ChatFAB />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/"             element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><AppLayout><AddExpense /></AppLayout></ProtectedRoute>} />
          <Route path="/insights"     element={<ProtectedRoute><AppLayout><Insights /></AppLayout></ProtectedRoute>} />
          <Route path="/ai-advisor"   element={<ProtectedRoute><AppLayout><AIAdvisor /></AppLayout></ProtectedRoute>} />
          <Route path="/chat"         element={<ProtectedRoute><AppLayout><Chatbot /></AppLayout></ProtectedRoute>} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
