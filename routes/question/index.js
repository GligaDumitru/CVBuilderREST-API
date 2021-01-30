const express = require("express");
const router = express.Router();
const Question = require("../../models/Question");
const mongoose = require("mongoose");

router.get("/", (req, res, next) => {
    // Return all items
    const questions = Question.find({}, (err, questions) => {
        if (err) {
            throw err;
        } else {
            res.status(200).json({
                questions
            });
        }
    });
});

router.delete("/:id", (req, res, next) => {
    const itemToDel = Question.findByIdAndDelete(req.params.id, err => {
        if (err) {
            res.status(400).json({
                message: "Question was with problem"
            });
        } else {
            res.status(200).json({
                message: "Question was deleted"
            });
        }
    });
});

// Get Question By Id
router.get("/:id", (req, res, next) => {
    const id = req.params.id;
    Question.findById(id, (err, question) => {
        if (err) {
            res.status(400).json({
                message: "Invalid Request",
                errorMessage: err.message
            });
        } else {
            res.status(200).json({
                question
            });
        }
    });
});

router.post("/", (req, res, next) => {
    const { name, email, question, answer = "no answer" } = req.body;
    const newItem = new Question({
        name, email, question, answer
    });

    newItem.save(err => {
        if (err) {
            res.status(400).json({
                message: "The Question was not found",
                errorMessage: err.message
            });
        } else {
            res.status(201).json({
                message: "Question was saved successfuly"
            });
        }
    });
});

router.put("/:id", (req, res, next) => {
    const { name, email, question, answer = "no answer", status = "offline" } = req.body;
    const updateItem = Question.findByIdAndUpdate(
        req.params.id,
        {
            $set: { name, email, question, answer, status }
        },
        (err, question) => {
            if (err) {
                res.status(400).json({
                    message: "The Question was not saved",
                    errorMessage: err.message
                });
            } else {
                res.status(200).json({
                    message: "Question was updated successfully",
                    question
                });
            }
        }
    );
});

module.exports = router;