const Validator = require('validator');
const Utils = require('../Functions')

module.exports = (data) => {
    let errors = {};
    data.email = !Utils.isEmpty(data.email) ? data.email : "";
    data.password = !Utils.isEmpty(data.password) ? data.password : "";

    if (!Validator.isEmail(data.email)) {
        errors.email = "[ERROR]: Email or Password are invalid!";
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = "[ERROR]: Email is required!";
    }

    if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = "[ERROR]: Password must be 6 chars!";
    }

    if (Validator.isEmpty(data.password)) {
        errors.password = "[ERROR]: Password is required!";
    }

    return {
        errors,
        isValid: Utils.isEmpty(errors)
    }
}