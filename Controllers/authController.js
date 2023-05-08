const catchAsync = require("../Utils/catchAsync");
const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("../Utils/appError");
const sendMail = require("../Utils/nodeMailer");
const crypto = require("crypto");
const {promisify} = require("util");

createTokenSend = function (user, statusCode, res) {
  const token = jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  user.password = undefined;

  return res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const user = await newUser.save();

  createTokenSend(user, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 401));
  }

  const user = await User.findOne({email: email}).select("+password");

  const isCorrect = await user.comparePassword(password, user.password);

  if (!user || !isCorrect) {
    return next(
      new AppError(
        "Incorrect Email or Password! Please check your email and password",
        401
      )
    );
  }

  createTokenSend(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const {email} = req.body;

  //1. if user is email is present or not
  const user = await User.findOne({email: email});

  //2. if user is present or not.
  if (!user) {
    return next(
      new AppError(
        "User doesn't exists, Please signup first using /signup route",
        401
      )
    );
  }

  const resetToken = user.createPasswordResetToken();

  const message = `Please send the patch request to ${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}.You only have 10 mins before the token expires.`;

  const mailOptions = {
    subject: "IPL-App-Reset-(Token expires in 10 mins)",
    message: message,
  };

  try {
    //3. create a nodemailer object and send mail with reset token
    await sendMail(mailOptions);

    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Reset Token has been sent to your mail",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresIn = undefined;
    await user.save({validateBeforeSave: false});
    return next(
      new AppError("Error occured while sending mail, please try again", 400)
    );
  }
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const {currentPassword, newPassword, newPasswordConfirm} = req.body;

  const user = await User.findOne({_id: req.user._id}).select("+password");

  console.log(user);

  if (currentPassword === newPassword) {
    return next(
      new AppError("Your current password and new password are same!", 401)
    );
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  user.passwordChangedAt = new Date().getTime();

  await user.save({validateBeforeSave: false});

  createTokenSend(user, 201, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let authToken = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    authToken = req.headers.authorization.split(" ")[1];
  }

  console.log(authToken);

  if (!authToken) {
    return next(
      new AppError("Please login first before you access this route", 401)
    );
  }

  const decodedToken = await promisify(jwt.verify)(
    authToken,
    process.env.JWT_SECRET_KEY
  );

  const user = await User.findById({_id: decodedToken.id});

  if (!user) {
    return next(
      new AppError("User not found! Please signIn first to continue..", 401)
    );
  }

  if (user.changedPasswordAfter(decodedToken.iat)) {
    return next(
      new AppError(
        "User has recently changed his password, so JWT is invalid! Please login again",
        401
      )
    );
  }

  req.user = user;

  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const {token} = req.params;

  if (!token) {
    return next(
      new AppError("password reset token is not present in the URL", 400)
    );
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresIn: {$gt: Date.now()},
  }).select("+password");

  if (!user) {
    next(
      new AppError(
        "Reset Token has expired!, Please use /forgotPassword route again",
        401
      )
    );
  }

  if (!user.comparePassword(req.body.password, user.password)) {
    return next(
      new AppError(
        "Password must be different from the current password!,Please provide a new password",
        401
      )
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresIn = undefined;
  user.passwordChangedAt = new Date().getTime();

  await user.save({validateBeforeSave: false});

  createTokenSend(user, 201, res);
});

exports.restrictTo = (roles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you are not authorized to access this route", 401)
      );
    }
    next();
  };
};
