const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const exphbs = require("express-handlebars");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const PDF = require('../../Utils/PDFV1')
router.get('/', async (req, res) => {
  const activate_account = fs.readFileSync(
    path.join(__dirname, "../../views/template1.handlebars"),
    "utf8"
  );
  const template = Handlebars.compile(activate_account);
  const nameGenerate = "/test-" + Math.random() + ".pdf";
  let document = {
    template: template({
      title: `Hi, Dumitru`,
      message: "Thank you for being a valued customer.",
      secondMessage: "Please click on the below link to activate your account.",
      linkName: "Activate Account",
      linkTo: 'www.google.com',
    }),
    context: {
      msg: 'Hello world'
    },
    path: "./routes/mail/" + nameGenerate
  }
  await PDF.create(document)
    .then(res => {

    })
    .catch(error => {
      console.error(error)

    })
  return res.sendFile(__dirname + nameGenerate);
})
router.post("/", (req, res) => {
  const { name, email, linkTo } = req.body;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cv.builder.oficial@gmail.com",
      pass: "cvbuilder2020",
    },
  });
  const activate_account = fs.readFileSync(
    path.join(__dirname, "../../views/activate_account.handlebars"),
    "utf8"
  );
  const template = Handlebars.compile(activate_account);

  let mailOptions = {
    from: "cv.builder.oficial@gmail.com",
    to: email,
    subject: "Activate Account",
    html: template({
      title: `Hi, ${name}`,
      message: "Thank you for being a valued customer.",
      secondMessage: "Please click on the below link to activate your account.",
      linkName: "Activate Account",
      linkTo: linkTo,
    }),
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      res.status(500).json({
        status: "failed",
        err: err,
      });
    } else {
      res.status(200).json({
        status: "success",
      });
    }
  });
});

module.exports = router;
