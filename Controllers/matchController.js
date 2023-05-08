const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const IPLData = require("../Models/IPLDataModel");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");
const APIFeatures = require("../Utils/apiFeatures");

exports.getMatchesAtStadium = catchAsync(async (req, res, next) => {
  console.log("all right we are heading now..");
  const year = req.params.year * 1;

  console.log(year);

  const matches = await IPLData.aggregate([
    {
      $match: {
        season: "2017",
      },
    },
    {
      $group: {
        _id: "$venue",
        totalMatches: {$sum: 1},
      },
    },
    {
      $project: {
        totalMatches: 1,
      },
    },
  ]);

  return res.status(200).json({
    status: "success",
    data: {
      matches,
    },
  });
});

exports.checkID =
  ("id",
  async (req, res, next, id) => {
    try {
      const validId = new ObjectId(id);
      const match = await IPLData.findById(validId);

      if (match === null) {
        next(new AppError("Match not found!", 404));
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  });

exports.getAllMatches = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(IPLData.find(), req.query)
    .filter()
    .sort()
    .fields()
    .paging();

  const matches = await features.query;

  return res.status(200).json({
    status: "success",
    data: {
      matches,
    },
  });
});

exports.getMatch = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const match = await IPLData.findById({_id: new ObjectId(id)});

  return res.status(200).json({
    status: "success",
    data: {
      match,
    },
  });
});

exports.createMatch = catchAsync(async (req, res) => {
  try {
    console.log(req.body);
    //1. Convert String to Json Object from req.body
    const match = {...req.body};
    //2. Use Save method to save the data to the database.
    await IPLData.create(match);

    return res.status(200).json({
      status: "success",
      data: {
        match,
      },
    });
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

exports.updateMatch = catchAsync(async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(id);
    //1. get the data from body
    const modifiedMatch = {...req.body};
    console.log(modifiedMatch);
    //2. find the body and copy the data as new object.
    const match = await IPLData.findByIdAndUpdate(id, modifiedMatch, {
      new: true,
    });

    return res.status(200).json({
      status: "success",
      data: {
        match,
      },
    });
    //3. find by id and replace.
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
});

exports.deleteMatch = catchAsync(async (req, res, next) => {
  console.log("a;skdjafd");
  // const id = req.params.id;
  // console.log('delete match is the main thing is..');
  // const match = await IPLData.findByIdAndDelete({_id: id});

  // return res.status(200).json({
  //   status: "success",
  //   data: {
  //     match,
  //   },
  //   message: "resource deleted successfully",
  // });
});
