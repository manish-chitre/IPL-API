const app = require("./app.js");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({path: `${__dirname}/config.env`});

const port = process.env.PORT;

const DB = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

(async () => {
  await mongoose.connect(DB);
  console.log("database connected successfully");
})();

const server = app.listen(port, () => {
  console.log(`server is listening on port: ${port}`);
});
