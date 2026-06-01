import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import Slider from '../../components/Slider/Slider';
import './Dashboard.css';

const Dashboard = ({ user, userRole }) => {
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Загрузка заявок для пользователя:', user.uid);
      
      const requestsRef = collection(db, 'requests');
      const q = query(
        requestsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      console.log('Найдено заявок:', querySnapshot.size);
      
      const userRequests = [];
      querySnapshot.forEach((doc) => {
        userRequests.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setRequests(userRequests);
      
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(reviewsRef, where('userId', '==', user.uid));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      const userReviews = {};
      reviewsSnapshot.forEach((doc) => {
        userReviews[doc.data().requestId] = doc.data().review;
      });
      setReviews(userReviews);
      
    } catch (err) {
      console.error('Ошибка загрузки заявок:', err);
      setError('Ошибка загрузки: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (requestId) => {
    if (!reviewText.trim()) {
      alert('Введите текст отзыва');
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        requestId: requestId,
        review: reviewText,
        createdAt: new Date().toISOString()
      });
      
      setReviews({ ...reviews, [requestId]: reviewText });
      setShowReviewModal(null);
      setReviewText('');
      alert('Спасибо за отзыв!');
    } catch (err) {
      console.error('Ошибка сохранения отзыва:', err);
      alert('Ошибка при сохранении отзыва: ' + err.message);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (window.confirm('Вы уверены, что хотите отменить эту заявку?')) {
      try {
        await deleteDoc(doc(db, 'requests', requestId));
        setRequests(requests.filter(r => r.id !== requestId));
        alert('Заявка отменена');
      } catch (err) {
        console.error('Ошибка отмены:', err);
        alert('Ошибка при отмене заявки');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Новая': return 'badge-new';
      case 'Идет обучение': return 'badge-learning';
      case 'Обучение завершено': return 'badge-completed';
      default: return 'badge-new';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'Новая': return 'Новая';
      case 'Идет обучение': return 'Идет обучение';
      case 'Обучение завершено': return 'Обучение завершено';
      default: return status || 'Новая';
    }
  };

  if (loading) {
    return <div className="loading">Загрузка заявок...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="empty-icon"></div>
        <h3>Ошибка загрузки</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={loadUserData}>Повторить</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Slider />
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Мои заявки ({requests.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Личные данные
        </button>
      </div>

      {activeTab === 'requests' && (
        <>
          {requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h3>У вас пока нет заявок</h3>
              <p>Оставьте первую заявку на интересующий курс</p>
              <a href="/new-request" className="btn-primary">+ Создать заявку</a>
            </div>
          ) : (
            <div className="requests-grid">
              {requests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h3>{request.courseName || 'Курс не указан'}</h3>
                    <span className={`status-badge ${getStatusBadge(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                  
                  <div className="request-details">
                    <div className="detail-item">
                      <span className="detail-label">Дата начала:</span>
                      <span className="detail-value">{request.startDate || 'Не указана'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Способ оплаты:</span>
                      <span className="detail-value">{request.paymentMethod || 'Не указан'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Дата создания:</span>
                      <span className="detail-value">
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString('ru-RU') : 'Неизвестно'}
                      </span>
                    </div>
                  </div>

                  {request.status === 'Новая' && (
                    <button 
                      className="cancel-btn"
                      onClick={() => handleCancelRequest(request.id)}
                    >
                      Отменить заявку
                    </button>
                  )}

                  {request.status === 'Обучение завершено' && !reviews[request.id] && (
                    <button 
                      className="review-btn"
                      onClick={() => setShowReviewModal(request.id)}
                    >
                      Оставить отзыв
                    </button>
                  )}

                  {reviews[request.id] && (
                    <div className="review-section">
                      <div className="review-label">Ваш отзыв:</div>
                      <div className="review-text">"{reviews[request.id]}"</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'profile' && (
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar"></div>
            <h2>{user?.email || 'Пользователь'}</h2>
            <span className={`role-badge ${userRole === 'admin' ? 'role-admin' : 'role-user'}`}>
              {userRole === 'admin' ? 'Администратор' : 'Пользователь'}
            </span>
          </div>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">UID:</span>
              <span className="info-value">{user?.uid}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Дата регистрации:</span>
              <span className="info-value">
                {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('ru-RU') : 'Неизвестно'}
              </span>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Оставить отзыв</h3>
            <textarea
              className="review-input"
              rows="4"
              placeholder="Поделитесь впечатлениями о курсе..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setShowReviewModal(null)}>
                Отмена
              </button>
              <button className="btn-primary" onClick={() => handleSubmitReview(showReviewModal)}>
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;