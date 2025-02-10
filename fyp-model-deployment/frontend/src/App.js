import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import StaffLogin from './components/StaffLogin';
import FormSubmission from './components/FormSubmission';
import CheckoutPatient from './components/CheckoutPatient';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext'; // Import AuthContext
import './App.css';

function App() {
  const { isLoggedIn, userRole } = useAuth(); // Get the logged-in status and user role

  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          {/* Redirect logged-in users to appropriate pages based on their role */}
          <Route path="/" element={
            isLoggedIn ? (
              userRole === 'admin' ? <Navigate to="/admin dashboard" /> : <Navigate to="/admission form" />
            ) : (
              <Home />
            )
          } />
          <Route path="/login" element={
            isLoggedIn ? (
              userRole === 'admin' ? <Navigate to="/admin dashboard" /> : <Navigate to="/admission form" />
            ) : (
              <StaffLogin />
            )
          } />

          {/* Protected routes for logged-in users */}
          <Route path="/admission form" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <FormSubmission />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <CheckoutPatient />
            </ProtectedRoute>
          } />
          <Route path="/admin dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
