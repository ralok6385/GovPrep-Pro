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
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { signupSchema, loginSchema, updateProfileSchema } = require('../validations/authValidation');

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
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
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

module.exports = router;
