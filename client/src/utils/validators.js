

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isValidPhone = (value) => /^[0-9]{10}$/.test(value);

export const isNumeric = (value) => value !== '' && !isNaN(value) && Number(value) >= 0;


export const validateEmployeeForm = (form) => {
  const errors = {};

  if (!form.employeeName?.trim()) errors.employeeName = 'Employee name is required';
  if (!form.employeeId?.trim()) errors.employeeId = 'Employee ID is required';

  if (!form.email?.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address';

  if (!form.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required';
  else if (!isValidPhone(form.phoneNumber)) errors.phoneNumber = 'Phone number must be exactly 10 digits';

  if (!form.department?.trim()) errors.department = 'Department is required';
  if (!form.designation?.trim()) errors.designation = 'Designation is required';

  if (form.salary === '' || form.salary === null || form.salary === undefined) {
    errors.salary = 'Salary is required';
  } else if (!isNumeric(form.salary) || Number(form.salary) <= 0) {
    errors.salary = 'Salary must be a positive number';
  }

  if (!form.joiningDate) errors.joiningDate = 'Joining date is required';

  return errors;
};
