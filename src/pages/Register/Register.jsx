import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = async () => {
    const newErrors = {};
    
    const loginRegex = /^[a-zA-Z0-9]{6,}$/;
    if (!loginRegex.test(formData.login)) {
      newErrors.login = 'Логин должен содержать только латинские буквы и цифры, минимум 6 символов';
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Введите ФИО';
    }
    
    const phoneRegex = /^\+?\d{10,12}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Введите корректный номер телефона (10-12 цифр)';
    }
    
    if (!formData.email.includes('@')) {
      newErrors.email = 'Введите корректный email';
    }
    
    const usersRef = collection(db, 'users');
    const loginQuery = query(usersRef, where('login', '==', formData.login));
    const loginSnap = await getDocs(loginQuery);
    if (!loginSnap.empty) {
      newErrors.login = 'Этот логин уже занят';
    }
    
    const emailQuery = query(usersRef, where('email', '==', formData.email));
    const emailSnap = await getDocs(emailQuery);
    if (!emailSnap.empty) {
      newErrors.email = 'Этот email уже зарегистрирован';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const validationErrors = await validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        login: formData.login,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        role: 'user',
        createdAt: new Date().toISOString()
      });
      
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: 'Ошибка регистрации: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h1>Регистрация</h1>
          <p>Создайте аккаунт для доступа к курсам</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Логин *</label>
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
              placeholder="только латиница и цифры, мин 6"
              required
            />
            {errors.login && <span className="field-error">{errors.login}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Пароль *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="минимум 8 символов"
                required
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Подтверждение пароля *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>ФИО *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Иванов Иван Иванович"
              required
            />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Телефон *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+71234567890"
                required
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ivan@example.com"
                required
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
          </div>

          {errors.general && <div className="error-message">{errors.general}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">Уже есть аккаунт? Войти</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;