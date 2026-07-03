
import { useState } from 'react';
import EmployeeList from './EmployeeList';
import EmployeeForm from './EmployeeForm';

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const openAddForm = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const openEditForm = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingEmployee(null);
    setRefreshKey((k) => k + 1); 
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Employee Dashboard</h1>
        {!showForm && (
          <button type="button" onClick={openAddForm}>
            + Add Employee
          </button>
        )}
      </div>

      {showForm ? (
        <>
          <EmployeeForm initialData={editingEmployee} onSuccess={handleSuccess} />
          <button type="button" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </>
      ) : (
        <EmployeeList onEdit={openEditForm} refreshKey={refreshKey} />
      )}
    </div>
  );
};

export default Dashboard;
