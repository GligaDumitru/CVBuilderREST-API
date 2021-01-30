const express = require("express");
const router = express.Router();
const Blog = require("../../models/Blog");
const mongoose = require("mongoose");
const User = require('../../models/User');

router.get("/", (req, res, next) => {
    // Return all items
    const blogs = Blog.find({}, (err, blogs) => {
        if (err) {
            throw err;
        } else {
            res.status(200).json({
                blogs
            });
        }
    });
});

router.delete("/:id", (req, res, next) => {
    const itemToDel = Blog.findByIdAndDelete(req.params.id, err => {
        if (err) {
            res.status(400).json({
                message: "Blog was with problem"
            });
        } else {
            res.status(200).json({
                message: "Blog was deleted"
            });
        }
    });
});

// Get Blog By Id
router.get("/:id", (req, res, next) => {
    const id = req.params.id;
    Blog.findById(id, (err, blog) => {
        if (err) {
            res.status(400).json({
                message: "Invalid Request",
                errorMessage: err.message
            });
        } else {
            User.findById(blog.author.id, (err, user) => {
                if (err) {
                    return res.status(200).json({
                        blog
                    });
                } else {
                    // const author = {
                    //     name: user.name,
                    //     avatar: user.avatar,
                    //     description: ''
                    // }
                    // blog.author = author
                    res.status(200).json({
                        blog
                    });
                }
            })
        }
    });
});

router.post("/", (req, res, next) => {
    const { title, subtitle, post, mainImage = "no mainImage", author, tags } = req.body;
    const newItem = new Blog({
        title, subtitle, post, mainImage, author, tags
    });

    newItem.save(err => {
        if (err) {
            res.status(400).json({
                message: "The Blog was not found",
                errorMessage: err.message
            });
        } else {
            res.status(201).json({
                message: "Blog was saved successfuly"
            });
        }
    });
});

router.patch("/:id", (req, res) => {
    const id = req.params.id;
    Blog.findOneAndUpdate({ _id: id }, req.body).then((user) => {
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
router.put("/:id", (req, res, next) => {
    const { title, subtitle, post, mainImage, author, tags } = req.body;
    const updateItem = Blog.findByIdAndUpdate(
        req.params.id,
        {
            $set: { title, subtitle, post, mainImage, author, tags }
        },
        (err, blog) => {
            if (err) {
                res.status(400).json({
                    message: "The Blog was not saved",
                    errorMessage: err.message
                });
            } else {
                res.status(200).json({
                    message: "Blog was updated successfully",
                    blog
                });
            }
        }
    );
});

module.exports = router;