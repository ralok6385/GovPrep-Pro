const { signupSchema } = require('./validations/authValidation');

describe('Auth Validation Schemas', () => {
    it('signupSchema should validate correct data', () => {
        const validData = {
            body: {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            }
        };
        const result = signupSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('signupSchema should fail on short password', () => {
        const invalidData = {
            body: {
                name: 'John Doe',
                email: 'john@example.com',
                password: '123'
            }
        };
        const result = signupSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});
