import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('auth'));
  const isAdmin = auth?.user?.role === 'Admin';
  const isUser = auth?.user?.role === 'User';

  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/login');
  };

  if (!auth) return null;

  return (
    <nav className="navigation">
      <div className="nav-brand">Book Store</div>
      <div className="nav-links">
        {isAdmin && (
          <>
            <Link to="/inventory" className="nav-link">Inventory Management</Link>
          </>
        )}
        {isUser && (
          <>
            <Link to="/cart" className="nav-link">Cart</Link>
            <Link to="/recommendations" className="nav-link">Recommendations</Link>
            <Link to="/feedback" className="nav-link">Feedback</Link>
          </>
        )}
        <Link to="/profile" className="nav-link">Profile</Link>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navigation;
