const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const gravatar = require("gravatar");
const validateRegister = require("../../Utils/validateRegister");
const validateLogin = require("../../Utils/validateLogin");
const validateResetPassword = require("../../Utils/validateResetPassword");
const User = require("../../models/User");
const Utils = require("../../Utils/Functions");
const fetch = require('node-fetch')
const nodemailer = require("nodemailer");
const exphbs = require("express-handlebars");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const FacebookStrategy = require('passport-facebook')
const crudUser = require('../../controllers/User')
const FormData = require("form-data");


router.post('/oauth/github', (req, res) => {

  const { client_id, redirect_uri, client_secret, code } = req.body;
  const data = new FormData();
  data.append("client_id", client_id);
  data.append("client_secret", client_secret);
  data.append("code", code);
  data.append("redirect_uri", redirect_uri);

  fetch(`https://github.com/login/oauth/access_token`, {
    method: "POST",
    body: data
  })
    .then(response => response.text())
    .then(paramsString => {

      let params = new URLSearchParams(paramsString);
      const access_token = params.get("access_token");
      const scope = params.get("scope");
      const token_type = params.get("token_type");
      return fetch(
        `https://api.github.com/user?access_token=${access_token}&scope=${scope}&token_type=${token_type}`,
        {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        }
      );
    })
    .then(response => response.json())
    .then(response => {
      const payload = {
        id: response.id,
        name: response.name,
        email: response.email,
        templates: [],
        avatar: response.avatar_url,
        accountActivated: true,
      };
      return crudUser.generateToken(payload).then(token => {
        return res.json(token)
      }).catch(err => {
        return res.json(err)
      })
    })
    .catch(error => {
      return res.status(400).json(error);
    });
})
router.post('/oauth/facebook', (req, res) => {

  const { name, picture, ...otherStuff } = req.body;
  let email = crudUser.generateCustomEmail(otherStuff.email, 'facebook')
  User.findOne({ email, accountType: 'facebook' }).then(user => {
    if (!user) {
      const newUserFromFacebook = {
        name,
        email,
        password: 'sandkjsandkjsadksabdkjsabdkjkj21bkj31b1k',
        avatar: picture.data.url,
        accountActivated: true,
        accountType: 'facebook'
      }
      crudUser.createUser(newUserFromFacebook).then((userPayload) => {
        const payload = {
          id: userPayload.id,
          name: userPayload.name,
          email: userPayload.email,
          templates: userPayload.templates,
          avatar: userPayload.avatar,
          accountActivated: userPayload.accountActivated,
          faceDetails: userPayload.faceDetails,
          faceLogin: userPayload.faceLogin,
          businessCardTemplates: userPayload.businessCardTemplates,
          coverLetterTemplates: userPayload.coverLetterTemplates,
          isSuprem: userPayload.isSuprem
        };
        crudUser.generateToken(payload).then(token => res.json(token)).catch(err => res.json(err))
      }).catch(err => res.json(err))
    } else {
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        templates: user.templates,
        avatar: picture.data.url,
        accountActivated: user.accountActivated,
        faceDetails: user.faceDetails,
        faceLogin: user.faceLogin,
        businessCardTemplates: user.businessCardTemplates,
        coverLetterTemplates: user.coverLetterTemplates,
        isSuprem: user.isSuprem
      };
      user.avatar = picture.data.url;
      user.save();
      return crudUser.generateToken(payload).then(token => {
        return res.json(token)
      }).catch(err => {
        return res.json(err)
      })
    }
  })
})

router.post("/reset-password", (req, res) => {
  const { errors, isValid } = validateResetPassword(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  let { email, tempPass, password } = req.body;

  User.findOne({ email }).then((user) => {
    if (!user) {
      errors.email = "[ERROR]: Email not exist in DB";
      return res.status(400).json(errors);
    } else {
      // console.log(user);
      if (!user.tempPassword.isActive) {
        errors.tempPass = "[ERROR]: This temporary password has been already used!";
        return res.status(400).json(errors);
      }
      if (user.tempPassword.pass !== tempPass) {
        errors.tempPass = "[ERROR]: Incorect temporary password.";
        return res.status(400).json(errors);
      }

      // crypt the pass
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.log("[ERROR]:Error while genSalt.", err);
        } else {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              console.log("[ERROR]:Error while hash password.", err);
            } else {
              password = hash;
              User.findOneAndUpdate(
                { _id: user._id },
                {
                  password,
                  tempPassword: {
                    pass: "",
                    exp: new Date(),
                    isActive: false,
                  },
                }
              ).then((user) => {
                if (user) {
                  res.status(200).json({
                    status: "success",
                    msg: "Password changed successfully",
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});
router.post("/forgot-password", (req, res) => {
  const { email, linkTo } = req.body;

  User.findOne({ email }).then((user) => {
    if (user) {
      const tempPassword = {
        pass: Utils.randomString(),
        exp: new Date(),
        isActive: true,
      };
      User.findOneAndUpdate({ _id: user._id }, { tempPassword }).then(
        (user) => {
          if (user) {
            let transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "cv.builder.oficial@gmail.com",
                pass: "cvbuilder2020",
              },
            });
            const forgot_password = fs.readFileSync(
              path.join(__dirname, "../../views/forgot_password.handlebars"),
              "utf8"
            );
            const template = Handlebars.compile(forgot_password);

            let mailOptions = {
              from: "cv.builder.oficial@gmail.com",
              to: email,
              subject: "Reset Password",
              html: template({
                title: `Hi, ${user.name}`,
                message:
                  "Oops, It's seems that you forgot your password. We generated a temporary password for you.Please click on the below link to finish the process of reseting password.",
                secondMessage: `Temporary Password:  ${tempPassword.pass}`,
                linkName: "Reset Password",
                linkTo: `${linkTo}/reset-password?email=${email}&pass=${tempPassword.pass}`,
              }),
            };

            transporter.sendMail(mailOptions, (err, data) => {
              if (err) {
                res.status(500).json({
                  status: "failed",
                  err: err,
                });
              } else {
                console.log("all good");
                res.status(200).json({
                  status: "success",
                });
              }
            });
          } else {
            return res.status(400).json({
              status: "failed to generate temporary password",
            });
          }
        }
      );
    } else {
      return res.status(404).json({
        status: "failed",
        msg: `User with email:${email} not found.`,
      });
    }
  });
});
router.patch("/:id", (req, res) => {
  const id = req.params.id;
  User.findOneAndUpdate({ _id: id }, req.body).then((user) => {
    if (user) {
      return res.status(200).json({
        status: "Successfully Updated ",
      });
    } else {
      return res.status(400).json({
        status: "Failed to update user ",
      });
    }
  });



});

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegister(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const { name, email, password } = req.body;

  User.findOne({ email, accountType: 'username-password' }).then((user) => {
    if (user) {
      errors.email = "[ERROR]: Email already exists.";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      const newUser = new User({
        name,
        email,
        password,
        avatar,
        accountActivated: false,
      });

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.log("[ERROR]:Error while genSalt.", err);
        } else {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              console.log("[ERROR]:Error while hash password.", err);
            } else {
              newUser.password = hash;
              newUser.save().then((user) => {
                res.status(201).json(user);
              });
            }
          });
        }
      });
    }
  });
});
router.get("/", (req, res) => {
  User.find({}).then((response) => {
    if (response) {
      return res.status(200).json(response);
    } else {
      return res.status(200).json("List is empty");
    }
  });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  User.findById(id, (err, user) => {
    if (err) {
      res.status(400).json({
        message: "Invalid Request",
        errorMessage: err.message
      });
    } else {
      const { accountActivated, avatar, email, name, templates, faceDetails, faceLogin, businessCardTemplates, coverLetterTemplates, isSuprem } = user
      res.status(200).json({
        accountActivated, avatar, email, name, templates, faceDetails, faceLogin, businessCardTemplates, coverLetterTemplates, isSuprem
      });
    }
  });
});

router.post("/login", (req, res) => {

  const { email, password, loginWithFaceRecognition = false } = req.body;

  if (loginWithFaceRecognition === true) {
    User.findOne({ email }).then((user) => {
      if (!user) {
        errors.email = "[ERROR]: Email or Password are invalid!";
        return res.status(404).json(errors);
      } else {
        if (password === user.password) {
          const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            templates: user.templates,
            avatar: user.avatar,
            accountActivated: user.accountActivated,
            faceLogin: user.faceLogin,
            businessCardTemplates: user.businessCardTemplates,
            coverLetterTemplates: user.coverLetterTemplates,
            isSuprem: user.isSuprem
          };

          jwt.sign(payload, "secret", { expiresIn: 3600 }, (err, token) => {
            if (err) {
              console.log("[ERROR]:Something went wrong at preparing token!");
            } else {
              res.status(200).json({
                success: true,
                token: `Bearer ${token}`,
              });
            }
          });
        }

      }
    });
  } else {
    const { errors, isValid } = validateLogin(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    User.findOne({ email }).then((user) => {
      if (!user) {
        errors.email = "[ERROR]: Email or Password are invalid!";
        return res.status(404).json(errors);
      } else {
        bcrypt.compare(password, user.password).then((isMatch) => {
          if (isMatch) {
            const payload = {
              id: user.id,
              name: user.name,
              email: user.email,
              templates: user.templates,
              avatar: user.avatar,
              accountActivated: user.accountActivated,
              faceLogin: user.faceLogin,
              businessCardTemplates: user.businessCardTemplates,
              coverLetterTemplates: user.coverLetterTemplates,
              isSuprem: user.isSuprem
            };

            jwt.sign(payload, "secret", { expiresIn: 3600 }, (err, token) => {
              if (err) {
                console.log("[ERROR]:Something went wrong at preparing token!");
              } else {
                res.status(200).json({
                  success: true,
                  token: `Bearer ${token}`,
                });
              }
            });
          } else {
            errors.password = "[ERROR]: Email or Password are invalid!";
            return res.status(400).json(errors);
          }
        });


      }
    });
  }




});

router.get("/register", (req, res) => {
  res.send("<h1>asd</h1>");
});

module.exports = router;
