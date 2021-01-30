const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const AnonimTemplate = require('../../models/AnonimTemplate');

router.get("/", (req, res, next) => {
    const anonimTemplate = AnonimTemplate.find({}, (err, anonimTemplates) => {
        if (err) {
            throw err;
        } else {
            res.status(200).json({
                anonimTemplates
            });
        }
    });
});


router.delete("/:id", (req, res, next) => {
    const itemToDel = AnonimTemplate.findByIdAndDelete(req.params.id, err => {
        if (err) {
            res.status(400).json({
                message: "AnonimTemplate was with problem"
            });
        } else {
            res.status(200).json({
                message: "AnonimTemplate was deleted"
            });
        }
    });
});


// Get AnonimTemplate By Id
router.get("/:id", (req, res, next) => {
    const id = req.params.id;
    AnonimTemplate.findById(id, (err, AnonimTemplate) => {
        if (err) {
            res.status(400).json({
                message: "Invalid Request",
                errorMessage: err.message
            });
        } else {
            res.status(200).json({
                AnonimTemplate
            });
        }
    });
});

router.get("/type/:templateType", (req, res, next) => {
    const templateType = req.params.templateType;
    AnonimTemplate.find({ templateType }, (err, AnonimTemplate) => {
        if (err) {
            res.status(400).json({
                message: "Invalid Request",
                errorMessage: err.message
            });
        } else {
            res.status(200).json({
                AnonimTemplate
            });
        }
    });
});
router.get("/name/:templateID", (req, res, next) => {
    const templateID = req.params.templateID;
    AnonimTemplate.find({ templateID }, (err, AnonimTemplate) => {
        if (err) {
            res.status(400).json({
                message: "Invalid Request",
                errorMessage: err.message
            });
        } else {
            res.status(200).json({
                AnonimTemplate
            });
        }
    });
});

router.post("/", (req, res) => {
    const { templateType = null, templateID = null, currentTemplate = null } = req.body;

    const newItem = new AnonimTemplate({
        templateType, templateID, currentTemplate
    });

    AnonimTemplate.find({ templateID }, (err, anonimTemplate) => {
        if (anonimTemplate.length) {
            let itemAlreadyExist = anonimTemplate[0];
            itemAlreadyExist.templateType = templateType;
            itemAlreadyExist.currentTemplate = currentTemplate;
            itemAlreadyExist.save(err => {
                if (err) {
                    res.status(400).json({
                        message: "The AnonimTemplate was not found",
                        errorMessage: err.message
                    });
                } else {
                    res.status(201).json({
                        message: "The anonim template was updated successfuly"
                    });
                }
            })
        } else {
            newItem.save(err => {
                if (err) {
                    res.status(400).json({
                        message: "The AnonimTemplate was not found",
                        errorMessage: err.message
                    });
                } else {
                    res.status(201).json({
                        message: "The anonim template was saved successfuly"
                    });
                }
            });
        }
    })
});

router.patch("/:id", (req, res) => {
    const id = req.params.id;
    AnonimTemplate.findOneAndUpdate({ _id: id }, req.body).then((user) => {
        if (user) {
            return res.status(200).json({
                status: "Successfully Updated ",
            });
        } else {
            return res.status(400).json({
                status: "Failed to update anonim template ",
            });
        }
    });
});

module.exports = router;