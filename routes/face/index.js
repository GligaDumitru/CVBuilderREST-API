
const express = require("express");
const router = express.Router();
const faceapi = require("face-api.js")
const canvas = require("canvas")
const fs = require("fs")
const path = require("path");
const FaceDescriptors = require('../../models/face');
const User = require("../../models/User");
// mokey pathing the faceapi canvas
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

const faceDetectionNet = faceapi.nets.ssdMobilenetv1

// SsdMobilenetv1Options
const minConfidence = 0.5

// TinyFaceDetectorOptions
const inputSize = 408
const scoreThreshold = 0.5

// MtcnnOptions
const minFaceSize = 50
const scaleFactor = 0.8

function getFaceDetectorOptions(net) {
    return net === faceapi.nets.ssdMobilenetv1
        ? new faceapi.SsdMobilenetv1Options({ minConfidence })
        : (net === faceapi.nets.tinyFaceDetector
            ? new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
            : new faceapi.MtcnnOptions({ minFaceSize, scaleFactor })
        )
}
const faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet)
const baseDir = path.resolve(__dirname, './out')
function saveFile(fileName, buf) {
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir)
    }
    // this is ok for prototyping but using sync methods
    // is bad practice in NodeJS
    fs.writeFileSync(path.resolve(baseDir, fileName), buf)
}

const getDescriptors = async (image) => {
    await faceDetectionNet.loadFromDisk(__dirname + '/weights')
    await faceapi.nets.faceLandmark68Net.loadFromDisk(__dirname + '/weights')
    await faceapi.nets.faceExpressionNet.loadFromDisk(__dirname + '/weights')
    await faceapi.nets.ageGenderNet.loadFromDisk(__dirname + '/weights')
    await faceapi.nets.faceRecognitionNet.loadFromDisk(__dirname + '/weights')
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(__dirname + '/weights')

    const results = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    if (!results.length) {
        return null;
    }
    return results;
}
router.get('/descriptor/:userId', async (req, res) => {
    const userId = req.params.userId;
    FaceDescriptors.findOne({ userId }, (err, faceDescriptors) => {
        if (err) {
            res.status(200).json({
                status: err,
            });
        }
        if (faceDescriptors) {
            res.status(200).json({
                status: faceDescriptors,
            });
        } else {
            res.status(400).json({
                message: "The FaceDetectors was not found",
                errorMessage: err.message
            });
        }
    })
})

router.post('/addDescriptor/:userId', async (req, res) => {
    const userId = req.params.userId;
    const img = await canvas.loadImage(__dirname + '/imgs_src/dan8.jpg')
    const descriptor1 = await getDescriptors(img);
    FaceDescriptors.findOne({ userId }, (err, faceDescriptors) => {
        if (err) {
            res.status(200).json({
                status: err,
            });
        }
        if (faceDescriptors) {
            // if (descriptor) {

            //     const labeledDs = descriptor.labeledDescriptors[0].descriptors[0]
            //     newModItem = {
            //         descriptors: [
            //             {
            //                 _distanceThreshold: 0.6,
            //                 _labeledDescriptors: [
            //                     {
            //                         _label: `Gliga-${userId}`,
            //                         _descriptors: [
            //                             ...faceDescriptors.descriptors[0]._labeledDescriptors[0]._descriptors,
            //                             labeledDs
            //                         ]
            //                     }
            //                 ]
            //             }
            //         ]
            //     }
            //     // res.status(200).json({
            //     //     status: descriptor,
            //     //     faceDescriptors,
            //     //     newModItem
            //     // });

            //     const updateItem = FaceDescriptors.findByIdAndUpdate(
            //         faceDescriptors._id,
            //         {
            //             $set: { descriptors:newModItem.descriptors }
            //         },
            //         (err, UpdatedItem) => {
            //             if (err) {
            //                 res.status(400).json({
            //                     message: "The UpdatedItem was not saved",
            //                     errorMessage: err.message
            //                 });
            //             } else {
            //                 res.status(200).json({
            //                     message: "UpdatedItem was updated successfully",
            //                 });
            //             }
            //         }
            //     );

            // } else 

            // {
            res.status(200).json({
                status: faceDescriptors,
            });
            // }

        } else {

            const newEntity = new FaceDescriptors({
                userId,
                label: `User-${userId}`,
                descriptors: new faceapi.LabeledFaceDescriptors(`User-${userId}`, [descriptor1[0].descriptor]),
                backup: descriptor1
            });
            newEntity.save((err, fd) => {
                if (err) {
                    res.status(400).json({
                        message: "The FaceDetectors was not found",
                        errorMessage: err.message
                    });
                } else {
                    res.status(201).json({
                        message: "FaceDetectors was saved successfuly",
                        fd
                    });
                }
            });
        }
    })
})


router.get("/", async (req, res, next) => {

    await faceDetectionNet.loadFromDisk(__dirname + '/weights')
    await faceapi.nets.faceLandmark68Net.loadFromDisk(__dirname + '/weights')
    await faceapi.nets.faceExpressionNet.loadFromDisk(__dirname + '/weights')
    await faceapi.nets.ageGenderNet.loadFromDisk(__dirname + '/weights')
    await faceapi.nets.faceRecognitionNet.loadFromDisk(__dirname + '/weights')
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(__dirname + '/weights')
    // const img = await canvas.loadImage(__dirname + '/imgs_src/dan3.jpg')
    const test1 = await canvas.loadImage(__dirname + '/imgs_src/dan8.jpg')
    // const results = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors()

    // if (!results.length) {
    //     return res.status(200).json({
    //         data: {
    //             name: []
    //         }
    //     });
    // }
    await FaceDescriptors.find({}, async (err, fds) => {
        if (err) {
            res.status(200).json({
                data: {
                    name: []
                }
            });
        }
        if (fds) {
            const labDes = []
            fds.map(fd => {
                if (fd.userId == "5ebadc45a99bde77b2efb20w") {
                    const toJs = new faceapi.LabeledFaceDescriptors(fd.label, [new Float32Array(Object.values(fd.descriptors[0]._descriptors[0]))])
                    labDes.push(toJs)
                }
            })
            if (labDes.length > 0) {
                const faceMatcher = new faceapi.FaceMatcher(labDes)
                const singleResult = await faceapi
                    .detectSingleFace(test1)
                    .withFaceLandmarks()
                    .withFaceDescriptor()
                if (singleResult) {
                    const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor)
                    res.status(200).json({
                        data: {
                            name: {
                                match: bestMatch.toString(),
                                fm: faceMatcher
                            }
                        }
                    });
                } else {
                    res.status(200).json({
                        data: {
                            name: results
                        }
                    });
                }

            } else {
                res.status(200).json({
                    data: {
                        name: []
                    }
                });
            }
        } else {
            res.status(200).json({
                data: {
                    name: []
                }
            });
        }
    })

});


module.exports = router;