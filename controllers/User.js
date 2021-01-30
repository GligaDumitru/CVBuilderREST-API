const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createUser = (userData) => {
    return new Promise((resolve, reject) => {
        const newUser = new User(userData);
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                reject({ err, errorMessage: "[ERROR]:Error while genSalt." })
            } else {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) {
                        reject({ err, errorMessage: "[ERROR]:Error while hash password." })
                    } else {
                        newUser.password = hash;
                        newUser.save().then((user) => {
                            resolve({ status: 201, user })
                        });
                    }
                });
            }
        });
    })

}

const generateToken = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, "secret", { expiresIn: 3600 }, (err, token) => {
            if (err) {
                 reject({
                    success: false,
                    err, errorMessage: "[ERROR]:Something went wrong at preparing token!"
                })
            } else {
                resolve({
                    success: true,
                    token: `Bearer ${token}`,
                })
            }
        });
    })
}

const generateCustomEmail = (email, type) => `${type}-${email}`

module.exports = {
    createUser,
    generateCustomEmail,
    generateToken
}
