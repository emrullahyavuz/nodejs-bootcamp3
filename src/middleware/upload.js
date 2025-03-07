const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.posix.join(__dirname, "..", "uploads");

    const slug = req.params.slug;

    if (req.baseUrl.includes("products")) {
      uploadPath = path.posix.join(uploadPath, "products", slug);
    } else if (req.baseUrl.includes("categories")) {
      uploadPath = path.posix.join(uploadPath, "categories", slug);
    }

    uploadPath = uploadPath.replace(/\\/g, "/");

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, fileName);
  },
});

// Dosya filtreleme
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Please upload an image"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
});

module.exports = upload;
