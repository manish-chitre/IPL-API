const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required for user"],
  },
  email: {
    type: String,
    required: [true, "email id is required and should be in lower case."],
    unique: true,
    validate: [validator.isEmail, "please provide your email"],
  },
  password: {
    type: String,
    required: [true, "password must be in min 6 characters in length"],
    min: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  passwordConfirm: {
    type: String,
    required: true,
    select: false,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "password mismatch! please provide the same password",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpiresIn: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
    this.passwordConfirm = undefined;
  }
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword,
  actualPassword
) {
  return await bcrypt.compare(candidatePassword, actualPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(26).toString("hex");

  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetToken = passwordResetToken;

  this.passwordResetExpiresIn = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  let changedPassTimeStamp = null;

  if (this.passwordChangedAt) {
    changedPassTimeStamp = parseInt(this.passwordChangedAt / 1000, 10);
    console.log(changedPassTimeStamp, JWTTimeStamp);
  }

  return JWTTimeStamp < changedPassTimeStamp;
};

const User = mongoose.model("User", userSchema);

(async () => {
  await User.ensureIndexes({email: true}, {unique: true});
})();

module.exports = User;
