const express = require("express");
const server = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const databaseMongoose = require("./database");
const passportConfig = require("./passport");
const userRouter = require("./routes/user");
const mailRouter = require("./routes/mail");
const PORT = process.env.PORT || 5000;
const exphbs = require("express-handlebars");
const path = require("path");
const feedbackRouter = require("./routes/feedback");
const questionRouter = require("./routes/question");
const templateRouter = require("./routes/template");
const blogRouter = require("./routes/blog");
const commentRouter = require("./routes/comment");
const faceRouter = require("./routes/face");
const anonimTemplateRouter = require("./routes/anonimTemplate");
const PDF = require('handlebars-pdf')
const fs = require('fs')
require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI || databaseMongoose.connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(
    (_) => console.log("Connection successfully to DB."),
    (err) =>
      console.log("[ERROR]:Something went wrong with DB. ", databaseMongoose)
  );

server.engine(
  "handlebars",
  exphbs({
    extname: "handlebars",
    defaultLayout: "",
    layoutsDir: "",
  })
);
server.set("view engine", "handlebars");

server.use(express.static('client/build'));
server.use(cors());
server.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
server.use(bodyParser.json({ limit: '50mb' }));

server.use(passport.initialize());
passportConfig(passport);

server.use("/api/v1/users", userRouter);
server.use("/api/v1/email", mailRouter);
server.use("/api/v1/feedback", feedbackRouter);
server.use("/api/v1/question", questionRouter)
server.use("/api/v1/template", templateRouter)
server.use("/api/v1/blogs", blogRouter)
server.use("/api/v1/comments", commentRouter)
server.use("/api/v1/face", faceRouter)
server.use("/api/v1/anonim", anonimTemplateRouter)


server.get('/', (req, res) => {
  return res.render('home');
})

// server.use(function (req, res) {
//   res.sendFile(path.join(__dirname, './client/build/index.html'));
// });

server.use(function (req, res, next) {
  next(createError(404));
});

// error handler
server.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.server.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ msg: "error" });
});

server.listen(PORT, (_) => console.log(`Server is running at port: ${PORT}`));
