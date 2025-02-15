import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import InventoryList from './components/InventoryList';

// Placeholder components for protected routes
const Cart = () => <div>Shopping Cart (User Only)</div>;
const Recommendations = () => <div>Book Recommendations (User Only)</div>;
const Feedback = () => <div>Book Feedback (User Only)</div>;
const Profile = () => <div>User Profile (All Authenticated Users)</div>;
const Unauthorized = () => (
  <div className="unauthorized">
    <h2>Unauthorized Access</h2>
    <p>You don't have permission to access this page.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Admin Routes */}
            <Route
              path="/inventory"
              element={
                <ProtectedRoute
                  element={<InventoryList />}
                  allowedRoles={['Admin']}
                />
              }
            />

            {/* User Routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute
                  element={<Cart />}
                  allowedRoles={['User']}
                />
              }
            />
            <Route
              path="/recommendations"
              element={
                <ProtectedRoute
                  element={<Recommendations />}
                  allowedRoles={['User']}
                />
              }
            />
            <Route
              path="/feedback"
              element={
                <ProtectedRoute
                  element={<Feedback />}
                  allowedRoles={['User']}
                />
              }
            />

            {/* Routes for both Admin and User */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  element={<Profile />}
                  allowedRoles={['Admin', 'User']}
                />
              }
            />

            {/* Default route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
