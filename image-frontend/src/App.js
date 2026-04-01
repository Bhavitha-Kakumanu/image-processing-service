import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Transform from './pages/Transform';
import BulkTransform from './pages/BulkTransform';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Admin from './pages/Admin';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};
const AdminRoute = ({ children }) => {
  const { userRole } = useAuth();
  return userRole === 'ADMIN' ? children : <Navigate to="/" />;
};

function AppContent() {
  const { token } = useAuth();
  return (
    <Router>
      {token && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/transform/:id" element={<ProtectedRoute><Transform /></ProtectedRoute>} />
        <Route path="/bulk-transform" element={<ProtectedRoute><BulkTransform /></ProtectedRoute>} />
        <Route path="/admin" element={
  <ProtectedRoute><AdminRoute><Admin /></AdminRoute></ProtectedRoute>
} />

      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}