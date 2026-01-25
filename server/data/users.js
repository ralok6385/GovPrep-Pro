const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin', // Will be hashed by pre-save hook
        role: 'admin',
        phone: '1234567890'
    }
];

module.exports = users;
