const { z } = require('zod');

const signupSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        targetExam: z.string().optional(),
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    })
});

const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional().or(z.literal('')),
        targetExam: z.string().optional(),
        language: z.string().optional(),
        avatar: z.string().optional(),
    })
});

module.exports = {
    signupSchema,
    loginSchema,
    updateProfileSchema
};
