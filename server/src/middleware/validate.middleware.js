// server/src/middleware/validate.middleware.js
// Generic validation middleware. Pass a Joi schema and which part of the
// request to validate ('body' by default, or 'query').

const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false, // collect all errors, not just the first
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  req[property] = value; // use the sanitized/coerced value
  next();
};

module.exports = validate;
