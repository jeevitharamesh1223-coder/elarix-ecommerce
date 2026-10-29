const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middlewares/authMiddleware');

// Ensure local uploads directory exists (fallback / dev)
const uploadDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage allows streaming to cloud storage or saving to disk
const storage = multer.memoryStorage();

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

// Helper for Supabase Cloud Storage
async function uploadToSupabaseStorage(fileBuffer, filename, mimetype) {
  const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'elarix-uploads';

  const uploadEndpoint = `${supabaseUrl}/storage/v1/object/${bucket}/${filename}`;
  const response = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      'Content-Type': mimetype,
      'x-upsert': 'true',
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase Storage upload failed (${response.status}): ${errorText}`);
  }

  // Public asset URL
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;
}

// POST /api/upload - Single image upload (Admin only)
router.post('/', protect, admin, (req, res) => {
  upload.single('image')(req, res, async (err) => {
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

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `product-${uniqueSuffix}${ext}`;

    try {
      if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)) {
        // Upload to Supabase Persistent Cloud Storage
        const publicUrl = await uploadToSupabaseStorage(req.file.buffer, filename, req.file.mimetype);
        return res.status(201).json({
          message: 'Image uploaded successfully to cloud storage',
          image: publicUrl,
          filename,
          storage: 'supabase',
        });
      } else {
        // Fallback to local disk storage
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        const publicUrl = `/uploads/${filename}`;

        if (process.env.NODE_ENV === 'production' && !process.env.UPLOADS_DIR) {
          console.warn('[ELARIX Upload Warning] Saved to local container disk. To persist on Render Free, configure SUPABASE_STORAGE_BUCKET.');
        }

        return res.status(201).json({
          message: 'Image uploaded successfully',
          image: publicUrl,
          filename,
          storage: 'local',
        });
      }
    } catch (uploadError) {
      console.error('[Upload Handler Error]', uploadError);
      return res.status(500).json({ message: `Failed to save image: ${uploadError.message}` });
    }
  });
});

module.exports = router;
