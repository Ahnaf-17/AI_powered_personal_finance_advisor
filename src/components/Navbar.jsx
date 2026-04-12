import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'
    }`;

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="text-white text-xl font-bold tracking-tight">
            💰 FinanceAdvisor
          </NavLink>
          <div className="flex items-center gap-1">
            <NavLink to="/"             className={linkClass}>Dashboard</NavLink>
            <NavLink to="/transactions" className={linkClass}>Transactions</NavLink>
            <NavLink to="/insights"     className={linkClass}>Goals</NavLink>
            <NavLink to="/ai-advisor"   className={linkClass}>AI Advisor</NavLink>
            <NavLink to="/chat"         className={linkClass}>Chat</NavLink>
            <span className="text-blue-200 text-sm px-3 hidden sm:block">
              {user?.name?.split(' ')[0]}
            </span>
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
