
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";

  // 🔴 Multer errors
  if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size exceeds limit";
    }
  }

  // 🔴 JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "TOKEN_EXPIRED";
  }

  res.status(statusCode).json({
    message,
  });
};

export default errorHandler;
