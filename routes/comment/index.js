const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Blog = require('../../models/Blog');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
router.get("/", (req, res, next) => {
    // Return all items
    const comments = Comment.find({}, (err, comments) => {
        if (err) {
            throw err;
        } else {
            res.status(200).json({
                comments
            });
        }
    });
});

router.delete("/:id", (req, res, next) => {
    const itemToDel = Comment.findByIdAndDelete(req.params.id, err => {
        if (err) {
            res.status(400).json({
                message: "Comment was with problem"
            });
        } else {
            res.status(200).json({
                message: "Comment was deleted"
            });
        }
    });
});

// Get Comment By Id
router.get("/:id", (req, res, next) => {
    const id = req.params.id;
    Comment.findById(id, (err, comment) => {
        if (err) {
            res.status(400).json({
                message: "Invalid Request",
                errorMessage: err.message
            });
        } else {
            res.status(200).json({
                comment
            });
        }
    });
});

router.post("/", (req, res) => {
    const { itemId, comments } = req.body;
    const newItem = new Comment({
        itemId, comments
    });

    newItem.save(err => {
        if (err) {
            res.status(400).json({
                message: "The Comment was not found",
                errorMessage: err.message
            });
        } else {
            res.status(201).json({
                message: "Comment was saved successfuly"
            });
        }
    });
});

router.put("/:id", (req, res, next) => {
    const { comments } = req.body;
    if (req.params.id === 'NoIDAvailable') {
        if (comments && comments.length > 0) {
            const blogId = comments[0].blogId;
            const newItem = new Comment({
                comments
            });

            newItem.save().then(comm => {
                if (comm) {
                    Blog.findByIdAndUpdate(
                        blogId,
                        {
                            $set: { commentId: comm._id }
                        },
                        (err, blog) => {
                            if (err) {
                                res.status(400).json({
                                    message: "The Comment was not saved",
                                    errorMessage: err.message
                                });
                            } else {
                                res.status(200).json({
                                    message: "Comment was updated successfully",
                                    blog
                                });
                            }
                        }
                    );
                }
            })
        } else {
            res.status(400).json({
                message: "The Comment was not saved",
                errorMessage: err.message
            });
        }
    } else Comment.findByIdAndUpdate(
        req.params.id,
        {
            $set: { comments }
        },
        (err, comment) => {
            if (err) {
                res.status(400).json({
                    message: "The Comment was not saved",
                    errorMessage: err.message
                });
            } else {
                res.status(200).json({
                    message: "Comment was updated successfully",
                    comment
                });
            }
        }
    );
});

module.exports = router;