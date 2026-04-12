import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
};

const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
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
