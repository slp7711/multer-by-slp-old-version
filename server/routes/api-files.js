const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const multer = require('multer')
const upload = multer({dest: 'uploads/'})
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const util = require('util');
const stream = require('stream');

const Imovel = require('../models/imoveis')

// Making connection to mongoDB
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', error => console.log(error));
db.once('open', () => {
    console.log('We are connected!');    
});

// Defining routers
router.get('/', (req, res) => {
    // res.send('Hello multer blabla');
    //res.sendFile(path.join(__dirname, '../index.html'));
    res.sendFile(path.join(__dirname, '..', 'index-files.html'));

    console.log('from api-file api')
    
});

router.get('/download/:filename', (req, res) => {

    //Creating a bucket to download a file from mongo db
    const bucket = new mongoose.mongo.GridFSBucket(db.db, {
        bucketName: 'images'
    });

    //bucket.openDownloadStreamByName('fotoSergio.jpeg')
    bucket.openDownloadStreamByName(req.params.filename)
        //The next line will save de file on our server 
            //.pipe(fs.createWriteStream('./sample-download.jpeg'))
        //The next line will send the file to res and display on browse
        .pipe(res)
        .on('error', ()=>{
            console.log("An error occurred...");
            res.send(error);
        })
        .on('finish', ()=> {
            console.log("done downloading");
            //res.send('Done Downloding');
        });

});

router.post('/register-new-property', upload.array('photos', 15), function (req, res) {

    // Creating a bucket and saving in database
    const bucket = new mongoose.mongo.GridFSBucket(db.db, {
        bucketName: 'images'
    });

    //Configuring a pipeline used to save files on db
    const pipeline = util.promisify(stream.pipeline);

    const files = req.files
    const newFilesArray = []

    async function run(file, uploadStream) {
        await pipeline (
            fs.createReadStream(__dirname + '/../uploads/' + file),
            uploadStream
        );

        console.log('File saved on db')
        
        // Deleting file in the server
        fs.unlink(__dirname + '/../uploads/' + file, (err) => {
            if (err) {
                console.log(err)
            }
            console.log('File removed from the server!!!')
            //return
        })
        
    }


    files.forEach(file => {

        //Configuring the file name to be saved on db
        const fileName = file.filename;
        const extension = file.originalname.split('.').pop();
        const fileNameToBeSavedOnDB = `${fileName}.${extension}`;

        //Pushing file to new array
        newFilesArray.push(fileNameToBeSavedOnDB)

        console.log('file renamed')

        //Saving the file with the name generated by multer plus the extension of the original file
        const uploadStream = bucket.openUploadStream(fileNameToBeSavedOnDB)



        run(fileName, uploadStream).catch(console.error);

    })

    console.log(newFilesArray)


    // Creating and saving a new instance of Imovel
    Imovel.create({
        type: req.body.type,
        description: req.body.description,
        price: req.body.price,
        imagesNames: newFilesArray
    }).then(function(imovel){
        res.send(imovel);
        console.log('Document created...');
    }).catch(error => {
        console.log(error);
        res.send('Impossible to create document: ' + error)
    })

});


module.exports = router;