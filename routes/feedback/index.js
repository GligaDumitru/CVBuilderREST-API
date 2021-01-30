const express = require("express");
const router = express.Router();
const Feedback = require("../../models/Feedback");
const mongoose = require("mongoose");

router.get("/", (req, res, next) => {
    // Return all items
    const feedbacks = Feedback.find({}, (err, feedbacks) => {
        if (err) {
            throw err;
        } else {
            res.status(200).json({
                feedbacks
            });
        }
    });
});

router.delete("/:id", (req, res, next) => {
    const itemToDel = Feedback.findByIdAndDelete(req.params.id, err => {
        if (err) {
            res.status(400).json({
                message: "Feedback was with problem"
            });
        } else {
            res.status(200).json({
                message: "Feedback was deleted"
            });
        }
    });
});

// Get Feedback By Id
router.get("/:id", (req, res, next) => {
    const id = req.params.id;
    Feedback.findById(id, (err, feedback) => {
        if (err) {
            res.status(400).json({
                message: "Invalid Request",
                errorMessage: err.message
            });
        } else {
            res.status(200).json({
                feedback
            });
        }
    });
});

router.post("/", (req, res, next) => {
    const { typeOfFeedback, opinion, rating, status = "offline", userId = '' } = req.body;
    const newItem = new Feedback({
        rating,
        opinion,
        typeOfFeedback,
        status,
        userId
    });

    newItem.save(err => {
        if (err) {
            res.status(400).json({
                message: "The Feedback was not found",
                errorMessage: err.message
            });
        } else {
            res.status(201).json({
                message: "Feedback was saved successfuly"
            });
        }
    });
});

router.put("/:id", (req, res, next) => {
    const { typeOfFeedback, opinion, rating, status = "offline", userId = '' } = req.body;
    const updateItem = Feedback.findByIdAndUpdate(
        req.params.id,
        {
            $set: { typeOfFeedback, opinion, rating, userId, status }
        },
        (err, Feedback) => {
            if (err) {
                res.status(400).json({
                    message: "The Feedback was not saved",
                    errorMessage: err.message
                });
            } else {
                res.status(200).json({
                    message: "Feedback was updated successfully",
                    Feedback
                });
            }
        }
    );
});

module.exports = router;