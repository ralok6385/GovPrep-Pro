const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (e) {
        console.error('Validation Middleware Error:', e);
        return res.status(400).json({
            message: "Validation Error",
            errors: (e.errors || []).map(err => ({
                path: Array.isArray(err.path) ? err.path.join('.') : (err.path || 'unknown'),
                message: err.message || 'Invalid input'
            }))
        });
    }
};

module.exports = validate;
