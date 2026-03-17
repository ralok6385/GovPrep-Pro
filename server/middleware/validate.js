const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (e) {
        if (e instanceof ZodError) {
            return res.status(400).json({
                message: "Validation Error",
                errors: e.issues.map(issue => ({
                    path: Array.isArray(issue.path) ? issue.path.join('.') : (issue.path || 'unknown'),
                    message: issue.message || 'Invalid input'
                }))
            });
        }
        // Non-Zod error — rethrow
        console.error('Validation Middleware Unexpected Error:', e);
        return res.status(500).json({ message: 'Internal validation error' });
    }
};

module.exports = validate;
