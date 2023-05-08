const User = require("../Models/userModel");
const catchAsync = require("../Utils/catchAsync");

exports.updateMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    {_id: req.user._id},
    {$set: req.body},
    {new: true}
  );

  return res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete({_id: req.user._id});

  return res.status(200).json({
    status: "success",
    message: "user has been deleted",
  });
});
