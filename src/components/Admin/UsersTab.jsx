import React, { useState } from 'react';
import { useUsers } from './UsersProvider'; // Importing the context
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported

const UsersTab = () => {
  const { admins, loading, error, addAdmin, editAdmin, deleteAdmin } = useUsers();
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '' });
  const [editAdminData, setEditAdminData] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleModalClose = () => {
    setModalShow(false);
    setNewAdmin({ username: '', email: '', password: '' });
    setEditAdminData(null);
    setIsEditing(false);
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setModalShow(true);
  };

  const handleEditClick = (admin) => {
    setEditAdminData(admin);
    setIsEditing(true);
    setModalShow(true);
  };

  const handleSubmit = () => {
    if (isEditing) {
      editAdmin(editAdminData.id, editAdminData);
    } else {
      addAdmin(newAdmin);
    }
    handleModalClose();
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  return (
    <div style={{background:'rgb(238,239,243)', padding : '40px', minHeight:'88vh'}}>
     

      {/* Button to add a new admin */}
      <button className="btn btn-primary mb-3" onClick={handleAddClick}>
        Добавить администратора
      </button>

      {/* List of admins */}
      <div className="row" >
        {admins.length > 0 ? (
          admins.map((admin) => (
            <div key={admin.id} className="col-md-4 mb-3">
              <div className="card" style={{background:'#ffffff'}}>
                <div className="card-body">
                  <h5 className="card-title">Имя: {admin.username}</h5>
                  <p className="card-text">Email: {admin.email}</p>
                  <button className="btn btn-warning me-2" onClick={() => handleEditClick(admin)}>Изменить</button>
                  <button className="btn btn-danger" onClick={() => deleteAdmin(admin.id)}>Удалить</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Нет администраторов для отображения.</p>
        )}
      </div>

      {/* Modal for adding/editing admins */}
      <div className={`modal fade ${modalShow ? 'show' : ''}`} style={{ display: modalShow ? 'block' : 'none' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isEditing ? 'Изменить администратора' : 'Добавить администратора'}</h5>
              <button type="button" className="close" onClick={handleModalClose} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="username">Имя пользователя</label>
                <input
                  type="text"
                  id="username"
                  className="form-control"
                  value={isEditing ? editAdminData.username : newAdmin.username}
                  onChange={(e) => isEditing ? setEditAdminData({ ...editAdminData, username: e.target.value }) : setNewAdmin({ ...newAdmin, username: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={isEditing ? editAdminData.email : newAdmin.email}
                  onChange={(e) => isEditing ? setEditAdminData({ ...editAdminData, email: e.target.value }) : setNewAdmin({ ...newAdmin, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Пароль</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder={isEditing ? "Новый пароль" : "Пароль"}
                  onChange={(e) => isEditing ? setEditAdminData({ ...editAdminData, password: e.target.value }) : setNewAdmin({ ...newAdmin, password: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleModalClose}>Отмена</button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                {isEditing ? 'Сохранить изменения' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTab;
