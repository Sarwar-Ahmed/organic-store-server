const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const fs = require('fs-extra');
// const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ebvmh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());
// app.use(express.static('service'));
// app.use(fileUpload());

// const admin = require('firebase-admin');

// const serviceAccount = require("./config/creative-agency-by-sarwar-firebase-adminsdk-offfh-05edaf557d.json");
const { ObjectId } = require('mongodb');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://creative-agency-by-sarwar.firebaseio.com"
// });

const port = 5000;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
   const categoriesCollection = client.db("OrganicStore").collection("categories");
   const productsCollection = client.db("OrganicStore").collection("products");

    app.post('/addCategories', (req, res) => {
        const events = req.body;
        console.log("added");
        categoriesCollection.insertMany(events)
        .then(result => {
            res.send(result.insertedCount)
        })
    })
    app.post('/addProducts', (req, res) => {
        const events = req.body;
        console.log("added");
        productsCollection.insertMany(events)
        .then(result => {
            res.send(result.insertedCount)
        })
    })

    app.get('/category', (req, res) => {
        categoriesCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.get('/products', (req, res) => {
        productsCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

});


app.get('/', (req, res) => {
    res.send("Hello Server");
})

app.listen(process.env.PORT || port)