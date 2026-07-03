
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import useDebounce from '../../hooks/useDebounce';

// gives each row a quick visual identity in the table (same person always
// gets the same color, no configuration needed).
const BADGE_COLORS = ['#0f9b8e', '#5b6bd6', '#d68c1f', '#d6455a', '#2f8f5b', '#7c5cd6'];
const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
const getBadgeColor = (name = '') => {
  const sum = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return BADGE_COLORS[sum % BADGE_COLORS.length];
};


const EmployeeList = ({ onEdit, refreshKey }) => {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');

  const [joiningDateFrom, setJoiningDateFrom] = useState('');
  const [joiningDateTo, setJoiningDateTo] = useState('');

  const [page, setPage] = useState(1);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosClient.get('/employees', {
        params: {
          search: debouncedSearch || undefined,
          department: department || undefined,
          designation: designation || undefined,
          joiningDateFrom: joiningDateFrom || undefined,
          joiningDateTo: joiningDateTo || undefined,
          page,
          limit: 10,
        },
      });
      setEmployees(res.data.data.employees);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchEmployees();
    
  }, [debouncedSearch, department, designation, joiningDateFrom, joiningDateTo, page, refreshKey]);

  
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, department, designation, joiningDateFrom, joiningDateTo]);

  const handleDelete = async (employee) => {
    const confirmed = window.confirm(`Delete ${employee.employeeName}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await axiosClient.delete(`/employees/${employee._id}`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setDepartment('');
    setDesignation('');
    setJoiningDateFrom('');
    setJoiningDateTo('');
  };

  return (
    <div className="employee-list-page">
      <h2>Employees</h2>

      {/* --- Search + Filter toolbar --- */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name, ID, email, department..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
          <option value="Finance">Finance</option>
        </select>

        <select value={designation} onChange={(e) => setDesignation(e.target.value)}>
          <option value="">All Designations</option>
          <option value="Intern">Intern</option>
          <option value="Associate">Associate</option>
          <option value="Manager">Manager</option>
          <option value="Lead">Lead</option>
        </select>

        <label>
          Joined From:
          <input
            type="date"
            value={joiningDateFrom}
            onChange={(e) => setJoiningDateFrom(e.target.value)}
          />
        </label>

        <label>
          Joined To:
          <input
            type="date"
            value={joiningDateTo}
            onChange={(e) => setJoiningDateTo(e.target.value)}
          />
        </label>

        <button type="button" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="field-error">{error}</p>}

      {/* --- Results table --- */}
      {!loading && !error && (
        <>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Salary</th>
                <th>Joining Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">No employees match these filters yet.</div>
                  </td>
                </tr>
              )}
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.employeeId}</td>
                  <td>
                    <div className="emp-name-cell">
                      <span
                        className="avatar-badge"
                        style={{ background: getBadgeColor(emp.employeeName) }}
                      >
                        {getInitials(emp.employeeName)}
                      </span>
                      {emp.employeeName}
                    </div>
                  </td>
                  <td>{emp.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>₹{Number(emp.salary).toLocaleString('en-IN')}</td>
                  <td>{new Date(emp.joiningDate).toLocaleDateString()}</td>
                  <td>
                    <button type="button" onClick={() => onEdit(emp)}>Edit</button>
                    <button type="button" onClick={() => handleDelete(emp)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* --- Pagination --- */}
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeList;
