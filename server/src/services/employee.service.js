// server/src/services/employee.service.js
const Employee = require('../models/Employee');
const ApiError = require('../utils/apiError');

// GET /employees?search=&department=&designation=&joiningDateFrom=&joiningDateTo=&page=&limit=
exports.listEmployees = async (query) => {
  const { search, department, designation, joiningDateFrom, joiningDateTo, page, limit } = query;

  const filter = {};

  // --- Search (matches name, employee ID, email, department, designation) ---
  if (search) {
    filter.$or = [
      { employeeName: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
      { designation: { $regex: search, $options: 'i' } },
    ];
  }

  // --- Filter by department / designation (exact dropdown filters) ---
  if (department) filter.department = department;
  if (designation) filter.designation = designation;

  // --- Date filter on joiningDate ---
  if (joiningDateFrom || joiningDateTo) {
    filter.joiningDate = {};
    if (joiningDateFrom) filter.joiningDate.$gte = new Date(joiningDateFrom);
    if (joiningDateTo) filter.joiningDate.$lte = new Date(joiningDateTo);
  }

  const skip = (page - 1) * limit;

  const [employees, total] = await Promise.all([
    Employee.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Employee.countDocuments(filter),
  ]);

  return {
    employees,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
  };
};

exports.getEmployeeById = async (id) => {
  const employee = await Employee.findById(id);
  if (!employee) throw new ApiError(404, 'Employee not found');
  return employee;
};

exports.createEmployee = async (data) => {
  const existing = await Employee.findOne({ $or: [{ email: data.email }, { employeeId: data.employeeId }] });
  if (existing) throw new ApiError(409, 'An employee with this email or employee ID already exists');

  return Employee.create(data);
};

exports.updateEmployee = async (id, data) => {
  const employee = await Employee.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!employee) throw new ApiError(404, 'Employee not found');
  return employee;
};

exports.deleteEmployee = async (id) => {
  const employee = await Employee.findByIdAndDelete(id);
  if (!employee) throw new ApiError(404, 'Employee not found');
};
