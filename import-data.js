const dotenv = require("dotenv");
const fs = require("fs");
const mongoose = require("mongoose");
const IPL = require("./Models/IPLDataModel");

dotenv.config({path: `${__dirname}/config.env`});

const iplData = JSON.parse(
  fs.readFileSync(`${__dirname}/Data/ipl-data.json`, "utf-8")
);

const DB = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

(async () => {
 // console.log(DB);
  const conn = await mongoose.connect(DB);
  //console.log(conn.connection);
  console.log("DATABASE has been connected successfully..");
})();


const importData = async () => {
  try {
    await IPL.create(iplData);
    console.log("successfully inserted data");
    process.exit(0);
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await IPL.deleteMany();
    console.log("successfully deleted all IPL data");
    process.exit(0);
  } catch (err) {
    console.log(err);
  }
};

(async () => {
  if (process.argv[2] === "--import") {
    await importData();
  } else if (process.argv[2] === "--delete") {
    await deleteData();
  }
})();
