const express = require("express");
const globalErrorHandler = require("./Controllers/errorController");
const matchRouter = require("./Routers/matchRouter");
const userRouter = require('./Routers/userRouter');
const app = express();
app.use(express.json());

if(process.env.NODE_ENV == 'development'){
    app.use(morgan('dev'))
}

app.use("/api/v1/matches", matchRouter);
app.use('/api/v1/users',userRouter);
app.use(globalErrorHandler);
module.exports = app;
