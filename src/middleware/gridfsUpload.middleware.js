

import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import path from "path";

/* =========================
   MULTER (MEMORY STORAGE)
========================= */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    try {
      const allowed = /jpeg|jpg|png|webp/;
      const ext = allowed.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mime = allowed.test(file.mimetype);

      if (ext && mime) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Only image files (jpg, png, webp) are allowed"
          )
        );
      }
    } catch (err) {
      cb(err);
    }
  },
});

/* =========================
   GRIDFS SAVE HELPER
========================= */
export const saveToGridFS = async (file, metadata = {}) => {
  if (!file) return null;

  const conn = mongoose.connection;
  if (!conn || !conn.db) {
    throw new Error("MongoDB not connected");
  }

  const bucket = new GridFSBucket(conn.db, {
    bucketName: "uploads",
  });

  const filename =
    Date.now() +
    "-" +
    Math.round(Math.random() * 1e9) +
    path.extname(file.originalname);

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(
      filename,
      {
        contentType: file.mimetype,
        metadata,
      }
    );

    uploadStream.on("error", (err) => {
      reject(err);
    });

    uploadStream.on("finish", () => {
      resolve({
        fileId: uploadStream.id, // ✅ CORRECT
        filename: filename,      // ✅ CORRECT
      });
    });

    uploadStream.end(file.buffer);
  });
};

export default upload;
