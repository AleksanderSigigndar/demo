import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import './AdminPanel.css';

const AdminPanel = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [notification, setNotification] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterAndSortRequests();
  }, [requests, filterStatus, searchTerm, sortField, sortDirection]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const requestsQuery = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
      const requestsSnap = await getDocs(requestsQuery);
      const allRequests = requestsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(allRequests);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRequests = () => {
    let filtered = [...requests];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredRequests(filtered);
    setCurrentPage(1);
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      setRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: newStatus } : r
      ));
      
      showNotification(`Статус заявки изменен на "${newStatus}"`);
    } catch (err) {
      console.error('Ошибка обновления:', err);
      showNotification('Ошибка при изменении статуса', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const getStatusOptions = (currentStatus) => {
    const options = ['Новая', 'Идет обучение', 'Обучение завершено'];
    return options.filter(opt => opt !== currentStatus);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Новая': return 'badge-new';
      case 'Идет обучение': return 'badge-learning';
      case 'Обучение завершено': return 'badge-completed';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Загрузка заявок...</div>;
  }

  return (
    <div className="admin-panel">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="admin-header">
        <h1>Панель администратора</h1>
        <p>Управление заявками на обучение</p>
      </div>

      <div className="admin-controls">
        <div className="filters">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Все статусы</option>
            <option value="Новая">Новая</option>
            <option value="Идет обучение">Идет обучение</option>
            <option value="Обучение завершено">Обучение завершено</option>
          </select>
          
          <input
            type="text"
            placeholder="Поиск по курсу или email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="stats">
          Всего: {filteredRequests.length} заявок
        </div>
      </div>

      <div className="requests-table-container">
        <table className="requests-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('courseName')}>
                Курс {sortField === 'courseName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('userEmail')}>
                Пользователь {sortField === 'userEmail' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Дата начала</th>
              <th>Способ оплаты</th>
              <th onClick={() => handleSort('createdAt')}>
                Дата создания {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.map((request) => (
              <tr key={request.id}>
                <td className="course-cell">{request.courseName}</td>
                <td>{request.userEmail}</td>
                <td>{request.startDate}</td>
                <td>{request.paymentMethod}</td>
                <td>{new Date(request.createdAt).toLocaleDateString('ru-RU')}</td>
                <td>
                  <span className={`status-badge-admin ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td>
                  <select
                    className="status-select"
                    onChange={(e) => handleStatusChange(request.id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Изменить статус</option>
                    {getStatusOptions(request.status).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Назад
          </button>
          <span className="page-info">
            Страница {currentPage} из {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Вперед →
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;