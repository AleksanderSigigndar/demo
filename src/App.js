import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Navbar from './components/Layout/Navbar';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import NewRequest from './pages/NewRequest/NewRequest';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import AdminRoute from './components/AdminRoute/AdminRoute';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();
          const role = userData?.role || 'user';
          setUserRole(role);
          setUser(currentUser);
        } catch (err) {
          console.error('Ошибка получения роли:', err);
          setUserRole('user');
          setUser(currentUser);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <Router>
      <Navbar user={user} userRole={userRole} />
      <div className="container fade-in">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={
            <PrivateRoute user={user}>
              <Dashboard user={user} userRole={userRole} />
            </PrivateRoute>
          } />
          <Route path="/new-request" element={
            <PrivateRoute user={user}>
              <NewRequest user={user} />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute user={user} userRole={userRole}>
              <AdminPanel />
            </AdminRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;