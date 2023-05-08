module.exports = (err, req, res, next) => {
  console.log("this is error middleware");
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    return showDevError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    return showProdError(err, res);
  }
};

const showDevError = (err, res) => {
  console.log(err.status, err.statusCode, err.message);
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const showProdError = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    return res.status(500).json({
      status: "error",
      message: "something went wrong",
    });
  }
};
