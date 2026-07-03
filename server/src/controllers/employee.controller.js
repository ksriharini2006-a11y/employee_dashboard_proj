// server/src/controllers/employee.controller.js
const employeeService = require('../services/employee.service');
const { success } = require('../utils/apiResponse');

exports.listEmployees = async (req, res, next) => {
  try {
    const result = await employeeService.listEmployees(req.query);
    return success(res, 200, result, 'Employees fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    return success(res, 200, employee, 'Employee fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    return success(res, 201, employee, 'Employee added successfully');
  } catch (err) {
    next(err);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    return success(res, 200, employee, 'Employee updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    await employeeService.deleteEmployee(req.params.id);
    return success(res, 200, null, 'Employee deleted successfully');
  } catch (err) {
    next(err);
  }
};
