const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = require("../models/User");
const options = {};
const FacebookTokenStrategy = require("passport-facebook-token");

options.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
options.secretOrKey = "secret";

module.exports = (passport) => {
  passport.use(
    new JWTStrategy(options, (jwt_payload, done) => {
      User.findById(jwt_payload)
        .then((user) => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch((err) => console.log(err));
    })
  );
  passport.use(
    "facebookToken",
    new FacebookTokenStrategy(
      {
        clientID: "2867855026661248",
        clientSecret: "f0a5d79da25def52c5476b4fcc59e88d",
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        console.log(profile)
        try {


          if (req.user) {
            // weare already logged in
            console.log("already loog", req.user);
          } else {
            // account creation
            let existUser = await User.findOne({ "facebook.id": profile.id });

            if (existUser) {
              return done(null, existUser);
            }

            console.log(profile)
            // check if we have someone with the same email
            existUser = await User.findOne({ email: profile.emails[0].value });

            if (existUser) {
              // add facebook to user in DB
              existUser.methods.push("facebook");
              existUser.facebook = {
                id: profile.id,
                email: profile.emails[0].value,
              };
              await existUser.save();
              return done(null, existUser);
            }

            // create new user
            const newUser = new User({
              name: "some from fb",
              password: "123",
              email: profile.emails[0].value,
              methods: ["facebook"],
              facebook: {
                id: profile.id,
                email: profile.emails[0].value,
              },
            });

            await newUser.save();
            done(null, newUser);
          }
        } catch (err) {
          done(error, false, error.message);
        }
      }
    )
  );
};
