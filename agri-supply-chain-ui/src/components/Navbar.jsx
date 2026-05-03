import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-[#1a6b3c] text-white p-4 shadow-md relative z-50">
      <div className="flex justify-between items-center">
        <div className="font-bold text-xl flex items-center gap-2">
          <span>🌾</span>
          <span>AgriChain</span>
        </div>
        
        <div className="text-lg font-medium hidden md:block absolute left-1/2 -translate-x-1/2">
          {title}
        </div>
        
        <div className="hidden sm:flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <span>{user.name || user.role}</span>
              <span className="bg-[#4CAF50] text-white px-2 py-0.5 rounded-full text-xs font-bold uppercase">
                {user.role}
              </span>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors btn-press"
          >
            Logout
          </button>
        </div>

        {/* Mobile menu button */}
        <button 
          className="sm:hidden text-white text-2xl focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="sm:hidden pt-4 pb-2 border-t border-[#155a31] mt-3">
          <div className="text-center font-semibold mb-3">{title}</div>
          {user && (
            <div className="flex justify-center items-center gap-2 text-sm mb-4">
              <span>{user.name || user.role}</span>
              <span className="bg-[#4CAF50] text-white px-2 py-0.5 rounded-full text-xs font-bold uppercase">
                {user.role}
              </span>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors btn-press"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
