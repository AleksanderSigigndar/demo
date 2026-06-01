import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import './NewRequest.css';

const courses = [
  { id: 1, name: 'Повышение квалификации: Современные веб-технологии', price: 15000 },
  { id: 2, name: 'Профессиональная переподготовка: Fullstack разработчик', price: 45000 },
  { id: 3, name: 'Охрана труда: Безопасность на рабочем месте', price: 8000 },
  { id: 4, name: 'Data Science и машинное обучение', price: 35000 },
  { id: 5, name: 'UX/UI дизайн: Основы проектирования', price: 25000 }
];

const paymentMethods = [
  'Банковская карта',
  'Безналичный расчет',
  'Оплата на сайте',
  'Рассрочка'
];

const NewRequest = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courseId: '',
    courseName: '',
    startDate: '',
    paymentMethod: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCourseChange = (e) => {
    const courseId = parseInt(e.target.value);
    const course = courses.find(c => c.id === courseId);
    setFormData({
      ...formData,
      courseId: courseId,
      courseName: course ? course.name : ''
    });
    if (errors.courseId) {
      setErrors({ ...errors, courseId: '' });
    }
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.courseId) {
      newErrors.courseId = 'Выберите курс';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Укажите дату начала';
    } else {
      const parts = formData.startDate.split('.');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        const selectedDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          newErrors.startDate = 'Дата не может быть в прошлом';
        }
      } else {
        newErrors.startDate = 'Используйте формат ДД.ММ.ГГГГ';
      }
    }
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Выберите способ оплаты';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Создание заявки для пользователя:', user.uid);
      
      const requestData = {
        userId: user.uid,
        userEmail: user.email,
        courseId: formData.courseId,
        courseName: formData.courseName,
        startDate: formData.startDate,
        paymentMethod: formData.paymentMethod,
        status: 'Новая',
        createdAt: new Date().toISOString()
      };
      
      console.log('Данные заявки:', requestData);
      
      const docRef = await addDoc(collection(db, 'requests'), requestData);
      console.log('Заявка создана с ID:', docRef.id);
      
      alert('Заявка успешно создана! Ожидайте подтверждения администратора.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Ошибка создания заявки:', err);
      alert('Ошибка при создании заявки: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-request-page">
      <div className="new-request-header">
        <h1>Новая заявка</h1>
        <p>Заполните форму для записи на курс</p>
      </div>

      <div className="request-form-container">
        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-group">
            <label>Выберите курс *</label>
            <select onChange={handleCourseChange} value={formData.courseId || ''}>
              <option value="">-- Выберите курс --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} — {course.price.toLocaleString()} ₽
                </option>
              ))}
            </select>
            {errors.courseId && <span className="field-error">{errors.courseId}</span>}
          </div>

          <div className="form-group">
            <label>Дата начала обучения *</label>
            <input
              type="text"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              placeholder="ДД.ММ.ГГГГ"
            />
            <small>Формат: 25.12.2024</small>
            {errors.startDate && <span className="field-error">{errors.startDate}</span>}
          </div>

          <div className="form-group">
            <label>Способ оплаты *</label>
            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
              <option value="">-- Выберите способ оплаты --</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
            {errors.paymentMethod && <span className="field-error">{errors.paymentMethod}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
              Отмена
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Отправка...' : 'Отправить заявку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequest;