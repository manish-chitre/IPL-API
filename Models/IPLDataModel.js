const mongoose = require("mongoose");

const iplDataSchema = mongoose.Schema(
  {
    season: {
      type: Number,
      required: [true, "season must be year"],
    },
    city: {
      type: String,
      required: [true, "city must be string"],
      null : true,
    },
    date: {
      type: Date,
      required: ["date must be of DD-MM-YYYY"],
    },
    team1: {
      type: String,
      required: [true, "a team name must be given"],
    },
    team2: {
      type: String,
      required: [true, "a team name must be given"],
    },
    toss_winner: {
      type: String,
      required: [true, "a toss winner must be string"],
    },
    toss_decision: {
      type: String,
      required: [true, "a toss decision must be string"],
      enum: {
        values: ["field", "bat"],
        message: "toss decision must be either filed or bat.",
      },
    },
    result: {
      type: String,
      required: [true],
      enum: {
        values: ["normal", "tie", "no result"],
        message: "result must be normal or tie or no result",
      },
    },
    dl_applied: {
      type: Number,
      required: [true, "dl_applied must be number"],
      enum: {
        values: [0, 1],
        message: "dl_applied must be either 0 or 1",
      },
    },
    winner: {
      type: String,
      required: [false],
      null: true,
    },
    win_by_runs: {
      type: Number,
      required: [true, "win_by_runs must be number"],
    },
    player_of_match: {
      type: String,
    },
    venue: {
      type: String,
      required: [true, "venue must be a string"],
    },
    umpire1: {
      type: String,
      required: [false, "umpire1 must be string"],
      null: true,
    },
    umpire2: {
      type: String,
      required: [false, "umpire2 must be string"],
      null: true,
    },
    umpire3: {
      type: String,
      null: true,
    },
  },
  {skipInvalid: true}
);

const IPL = mongoose.model("IPL", iplDataSchema);

module.exports = IPL;
