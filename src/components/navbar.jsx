import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/leads" className="nav-brand">
            Lead Management
          </Link>
          <div className="nav-links">
            <Link 
              to="/leads" 
              className={`nav-link ${location.pathname === '/leads' ? 'active' : ''}`}
            >
              Leads
            </Link>
            <Link 
              to="/leads/new" 
              className={`nav-link ${location.pathname === '/leads/new' ? 'active' : ''}`}
            >
              Add Lead
            </Link>
          </div>
        </div>
        
        <div className="nav-right">
          <div className="user-info">
            <span>Hello, {user.first_name}</span>
          </div>
          <button onClick={onLogout} className="btn btn-outline">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;