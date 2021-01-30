const Validator = require('validator');
const Utils = require('../Functions')

module.exports = (data) => {
    let errors = {};
    data.name = !Utils.isEmpty(data.name) ? data.name : "";
    data.email = !Utils.isEmpty(data.email) ? data.email : "";
    data.password = !Utils.isEmpty(data.password) ? data.password : "";
    data.password_confirm = !Utils.isEmpty(data.password_confirm) ? data.password_confirm : "";

    if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = "[ERROR]: Name must be at least 2 characters!"
    }
    if (Validator.isEmpty(data.name)) {
        errors.name = "[ERROR]: Name field is required!"
    }
    if (!Validator.isEmail(data.email)) {
        errors.email = "[ERROR]: Email is invalid!";
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
    if (!Validator.isLength(data.password_confirm, { min: 6, max: 30 })) {
        errors.password_confirm = "[ERROR]: Password Confirm must have 6 chars!";
    }

    if (!Validator.equals(data.password, data.password_confirm)) {
        errors.password_confirm = "[ERROR]: Password and Confirm Password must match!";
    }

    if (Validator.isEmpty(data.password_confirm)) {
        errors.password_confirm = "[ERROR]: Password confirm is required!";
    }
    return {
        errors,
        isValid: Utils.isEmpty(errors)
    }
}