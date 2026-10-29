const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middlewares/authMiddleware');

// Ensure uploads directory exists
const uploadDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

// File validation filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpg|jpeg|png|webp|svg/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype;

  if (allowedExtensions.test(ext) && (mime.startsWith('image/') || mime === 'image/svg+xml')) {
    cb(null, true);
  } else {
    cb(new Error('Only valid image files (.jpg, .jpeg, .png, .webp, .svg) are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter,
});

// POST /api/upload - Single image upload (Admin only)
router.post('/', protect, admin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds maximum 5MB limit' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const publicUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
      message: 'Image uploaded successfully',
      image: publicUrl,
      filename: req.file.filename,
    });
  });
});

module.exports = router;
