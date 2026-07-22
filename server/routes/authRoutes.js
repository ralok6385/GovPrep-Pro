const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    authUser,
    registerUser,
    getUserProfile,
    selectExam,
    getUsers,
    updateUserProfile,
    updateProfileImage,
    toggleUserStatus,
    deleteUser,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { signupSchema, loginSchema, updateProfileSchema } = require('../validations/authValidation');

const fs = require('fs');

// Ensure uploads directory exists for cases where it's gitignored on cloud host
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function checkFileType(file, cb) {
    // SECURITY: Check both extension AND MIME type to prevent file type spoofing
    const allowedExtensions = /\.(jpg|jpeg|png|webp)$/i;
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    const extOk = allowedExtensions.test(path.extname(file.originalname));
    const mimeOk = allowedMimeTypes.includes(file.mimetype);

    if (extOk && mimeOk) {
        return cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, and WebP images are allowed'));
    }
}

const upload = multer({
    storage,
    // SECURITY: Limit avatar uploads to 2MB — prevents DoS via large file uploads.
    // The general upload middleware had a 50MB limit but this endpoint had none.
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/signup', validate(signupSchema), registerUser);
router.post('/login', validate(loginSchema), authUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, validate(updateProfileSchema), updateUserProfile);
router.put('/profile/avatar', protect, upload.single('image'), updateProfileImage);
router.put('/select-exam', protect, selectExam);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/status', protect, admin, toggleUserStatus);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
