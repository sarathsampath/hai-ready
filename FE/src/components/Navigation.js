import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';
import AddBook from './AddBook';

const Navigation = () => {
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('auth'));
  const isAdmin = auth?.user?.role === 'Admin';
  const isUser = auth?.user?.role === 'User';
  const [showAddModal, setShowAddModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/login');
  };

  if (!auth) return null;

  return (
    <nav className="navigation">
      <div className="nav-brand">Book Store</div>
      <div className="nav-links">
        <Link to="/books" className="nav-link">Books</Link>
        {isAdmin && (
          <>
            {/* <Link to="/inventory" className="nav-link">Inventory Management</Link> */}
            <button
              className="nav-link add-book-btn"
              onClick={() => setShowAddModal(true)}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                padding: '8px 16px',
                marginLeft: '10px'
              }}
            >
              Add New Book
            </button>
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
      <AddBookModal show={showAddModal} onClose={() => setShowAddModal(false)} />
    </nav>
  );
};

// Add modal component at the bottom
const AddBookModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        <button
          className="modal-close"
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '15px',
            top: '15px',
            background: 'none',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            padding: '5px',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            borderRadius: '50%',
            lineHeight: '1',
            transition: 'all 0.2s ease',
            fontFamily: 'Arial, sans-serif'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f0f0f0';
            e.target.style.color = '#333';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#666';
          }}
        >
          ×
        </button>
        <AddBook
          onClose={onClose}
          onBookAdded={() => {
            // Find and refresh the InventoryList component
            const inventoryList = document.querySelector('.inventory-container');
            if (inventoryList) {
              const event = new CustomEvent('bookAdded');
              inventoryList.dispatchEvent(event);
            }
          }}
        />
      </div>
    </div>
  );
};


export default Navigation;
