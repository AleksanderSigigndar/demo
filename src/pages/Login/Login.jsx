import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import './Login.css';

const Login = () => {
  const [loginOrEmail, setLoginOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getEmailByLogin = async (login) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('login', '==', login));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return userData.email;
      }
      return null;
    } catch (err) {
      console.error('Ошибка поиска логина:', err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let email = loginOrEmail;
      
      const isEmail = loginOrEmail.includes('@');
      
      if (!isEmail) {
        const foundEmail = await getEmailByLogin(loginOrEmail);
        if (!foundEmail) {
          setError('Пользователь с таким логином не найден');
          setLoading(false);
          return;
        }
        email = foundEmail;
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      let role = 'user';
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        role = userData.role || 'user';
      }
      
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Неверный логин/email или пароль');
      } else if (err.code === 'auth/user-not-found') {
        setError('Пользователь не найден');
      } else {
        setError('Ошибка входа: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Вход</h1>
          <p>Введите логин или email для входа</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Логин или Email</label>
            <input
              type="text"
              value={loginOrEmail}
              onChange={(e) => setLoginOrEmail(e.target.value)}
              placeholder="логин или your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="минимум 8 символов"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/register">Еще не зарегистрированы? Регистрация</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;