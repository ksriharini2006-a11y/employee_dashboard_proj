
import { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { validateEmployeeForm } from '../../utils/validators';

const emptyForm = {
  employeeName: '',
  employeeId: '',
  email: '',
  phoneNumber: '',
  department: '',
  designation: '',
  salary: '',
  joiningDate: '',
};

const EmployeeForm = ({ initialData = null, onSuccess }) => {
  const isEditMode = Boolean(initialData);

  const [form, setForm] = useState(
    initialData
      ? { ...initialData, joiningDate: initialData.joiningDate?.slice(0, 10) }
      : emptyForm
  );
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    
    if (name === 'phoneNumber' && value !== '' && !/^[0-9]*$/.test(value)) return;
    
    if (name === 'salary' && value !== '' && !/^\d*\.?\d*$/.test(value)) return;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validateEmployeeForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      const payload = { ...form, salary: Number(form.salary) };

      if (isEditMode) {
        await axiosClient.put(`/employees/${initialData._id}`, payload);
      } else {
        await axiosClient.post('/employees', payload);
        setForm(emptyForm);
      }

      onSuccess?.();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      <h2>{isEditMode ? 'Edit Employee' : 'Add Employee'}</h2>

      <label htmlFor="employeeName">Employee Name</label>
      <input id="employeeName" name="employeeName" value={form.employeeName} onChange={handleChange} />
      {errors.employeeName && <p className="field-error">{errors.employeeName}</p>}

      <label htmlFor="employeeId">Employee ID</label>
      <input id="employeeId" name="employeeId" value={form.employeeId} onChange={handleChange} disabled={isEditMode} />
      {errors.employeeId && <p className="field-error">{errors.employeeId}</p>}

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
      {errors.email && <p className="field-error">{errors.email}</p>}

      <label htmlFor="phoneNumber">Phone Number</label>
      <input
        id="phoneNumber"
        name="phoneNumber"
        inputMode="numeric"
        maxLength={10}
        value={form.phoneNumber}
        onChange={handleChange}
      />
      {errors.phoneNumber && <p className="field-error">{errors.phoneNumber}</p>}

      <label htmlFor="department">Department</label>
      <input id="department" name="department" value={form.department} onChange={handleChange} />
      {errors.department && <p className="field-error">{errors.department}</p>}

      <label htmlFor="designation">Designation</label>
      <input id="designation" name="designation" value={form.designation} onChange={handleChange} />
      {errors.designation && <p className="field-error">{errors.designation}</p>}

      <label htmlFor="salary">Salary</label>
      <input id="salary" name="salary" inputMode="decimal" value={form.salary} onChange={handleChange} />
      {errors.salary && <p className="field-error">{errors.salary}</p>}

      <label htmlFor="joiningDate">Joining Date</label>
      <input
        id="joiningDate"
        name="joiningDate"
        type="date"
        value={form.joiningDate}
        onChange={handleChange}
      />
      {errors.joiningDate && <p className="field-error">{errors.joiningDate}</p>}

      {apiError && <p className="field-error">{apiError}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : isEditMode ? 'Update Employee' : 'Add Employee'}
      </button>
    </form>
  );
};

export default EmployeeForm;
