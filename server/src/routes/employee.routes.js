// server/src/routes/employee.routes.js
const router = require('express').Router();
const { verifyToken } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const employeeValidator = require('../validators/employee.validator');
const employeeController = require('../controllers/employee.controller');

router.get(
  '/',
  verifyToken,
  validate(employeeValidator.listQuery, 'query'),
  employeeController.listEmployees
);
router.get('/:id', verifyToken, employeeController.getEmployee);
router.post('/', verifyToken, validate(employeeValidator.create), employeeController.createEmployee);
router.put('/:id', verifyToken, validate(employeeValidator.update), employeeController.updateEmployee);
router.delete('/:id', verifyToken, employeeController.deleteEmployee);

module.exports = router;
