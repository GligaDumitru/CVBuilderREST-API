const express = require("express");
const router = express.Router();
const Template = require("../../models/Template");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const PDF = require('../../Utils/PDFV1')
const HTMLtoDOCX = require('html-to-docx')
router.get("/", (req, res, next) => {
    // Return all items
    const templates = Template.find({}, (err, templates) => {
        if (err) {
            throw err;
        } else {
            res.status(200).json({
                templates
            });
        }
    });
});

router.get("/getpdf/:userId/:templateId", (req, res) => {
    const userId = req.params.userId;
    const templateId = req.params.templateId;
    let nameGenerate = `/${templateId}--${userId}.pdf`
    if (userId && templateId) {
        if (userId === 'anonim') {
            nameGenerate = `/anonim--${templateId}.pdf`;
            return res.sendFile(__dirname + nameGenerate);
        }
        if (fs.existsSync(__dirname + nameGenerate)) {
            return res.sendFile(__dirname + nameGenerate);
        }
        nameGenerate = `/anonim--${templateId}.pdf`;
        if (fs.existsSync(__dirname + nameGenerate)) {
            return res.sendFile(__dirname + nameGenerate);
        } else {
            return res.status(404).json({ msg: 'File not foun!' })
        }

    } else {
        return res.status(400).json({
            msg: "No file found!"
        })
    }
})


router.post("/preview", async (req, res) => {
    const { resumeTemplateId = null, currentTemplateName = null, currentTemplateId = null, businessTemplateName = null, coverLetterTemplateId = null, currentUserId = null } = req.body;
    let fileToLoad = 'businessCardTemplate';
    let nameGenerate = "/anonim-pdf.pdf";
    let document = {};

    if (currentTemplateName) {
        if (currentTemplateId && currentUserId) {
            nameGenerate = `/${currentTemplateId}--${currentUserId}.pdf`
        } else if (resumeTemplateId) {
            nameGenerate = `/anonim--${resumeTemplateId}.pdf`
        }
        switch (currentTemplateName) {
            case 'Modern_Template_1':
                fileToLoad = 'modernTemplate1'
                break;
            case 'Template_9':
                fileToLoad = 'simpleTemplate1'
                break;
            case 'Modern_Template_2':
                fileToLoad = 'modernTemplate2'
                break;
            case 'Modern_Template_3':
                fileToLoad = 'modernTemplate3'
                break;
            default:
                fileToLoad = 'europassTemplate1'
                break;
        }
    } else if (businessTemplateName) {
        if (req.body.currentUserId) {
            nameGenerate = `/${businessTemplateName}--${req.body.currentUserId}.pdf`
        } else {
            nameGenerate = `/anonim--${businessTemplateName}.pdf`;
        }
        fileToLoad = 'businessCardTemplate';

    } else if (coverLetterTemplateId) {
        if (req.body.currentUserId) {
            nameGenerate = `/${coverLetterTemplateId}--${req.body.currentUserId}.pdf`;
        } else {
            nameGenerate = `/anonim--${coverLetterTemplateId}.pdf`;
        }
        fileToLoad = 'coverLetterTemplate'

    } else {
        return res.status(400).json({
            msg: "No file found!"
        })
    }

    const activate_account = fs.readFileSync(path.join(__dirname, `../../views/${fileToLoad}.handlebars`), "utf8");

    const template = Handlebars.compile(activate_account);

    Handlebars.registerHelper("when", function (operand_1, operator, operand_2, options) {
        var operators = {
            'eq': function (l, r) { return l == r; },
            'noteq': function (l, r) { return l != r; },
            'gt': function (l, r) { return Number(l) > Number(r); },
            'or': function (l, r) { return l || r; },
            'and': function (l, r) { return l && r; },
            '%': function (l, r) { return (l % r) === 0; }
        }
        var result = operators[operator](operand_1, operand_2);

        if (result)
            return options.fn(this);
        else
            return options.inverse(this);
    });

    document = {
        template: template({ data: req.body }),
        context: {},
        path: "./routes/template/" + nameGenerate
    }
    await PDF.create(document).then(r => console.log('')).catch(error => { console.error(error) })

    return res.sendFile(__dirname + nameGenerate);
})
router.delete("/:id", (req, res, next) => {
    const itemToDel = Template.findByIdAndDelete(req.params.id, err => {
        if (err) {
            res.status(400).json({
                message: "Template was with problem"
            });
        } else {
            res.status(200).json({
                message: "Template was deleted"
            });
        }
    });
});

// Get Template By Id
router.get("/:id", (req, res, next) => {
    const id = req.params.id;
    Template.findById(id, (err, Template) => {
        if (err) {
            res.status(400).json({
                message: "Invalid Request",
                errorMessage: err.message
            });
        } else {
            res.status(200).json({
                Template
            });
        }
    });
});

router.post("/", (req, res, next) => {
    const newItem = new Template(req.body);

    newItem.save(err => {
        if (err) {
            res.status(400).json({
                message: "The Template was not found",
                errorMessage: err.message
            });
        } else {
            res.status(201).json({
                message: "Template was saved successfuly"
            });
        }
    });
});

router.put("/:id", (req, res, next) => {
    const { name, email, Template, answer = "no answer" } = req.body;
    const updateItem = Template.findByIdAndUpdate(
        req.params.id,
        {
            $set: { name, email, Template, answer }
        },
        (err, Template) => {
            if (err) {
                res.status(400).json({
                    message: "The Template was not saved",
                    errorMessage: err.message
                });
            } else {
                res.status(200).json({
                    message: "Template was updated successfully",
                    Template
                });
            }
        }
    );
});

module.exports = router;