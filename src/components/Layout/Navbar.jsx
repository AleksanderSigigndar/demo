import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import './Navbar.css';

const Navbar = ({ user, userRole }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Ошибка выхода:', err);
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="logo">
          <span className="logo-text">Учусь.РФ</span>
        </Link>

        {user ? (
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">Личный кабинет</Link>
            <Link to="/new-request" className="nav-link nav-link-primary">+ Заявка</Link>
            {userRole === 'admin' && (
              <Link to="/admin" className="nav-link nav-link-admin">Админ панель</Link>
            )}
            <button onClick={handleLogout} className="logout-btn">Выйти</button>
          </div>
        ) : (
          <div className="nav-links">
            <Link to="/login" className="nav-link">Вход</Link>
            <Link to="/register" className="nav-link nav-link-primary">Регистрация</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;