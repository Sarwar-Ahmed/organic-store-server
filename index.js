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

const admin = require('firebase-admin');

const serviceAccount = require("./config/organic-store-ecommerce-firebase-adminsdk-7wdac-71c023a222.json");
const { ObjectId } = require('mongodb');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
//   databaseURL: "https://creative-agency-by-sarwar.firebaseio.com"
});

const port = 5000;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
   const categoriesCollection = client.db("OrganicStore").collection("categories");
   const productsCollection = client.db("OrganicStore").collection("products");
   const cartCollection = client.db("OrganicStore").collection("cart");
   const ordersCollection = client.db("OrganicStore").collection("orders");


    app.post('/addCategories', (req, res) => {
        const events = req.body;
        console.log("added");
        categoriesCollection.insertMany(events)
        .then(result => {
            res.status(200).send(result.insertedCount)
        })
    })
    app.post('/addProducts', (req, res) => {
        const events = req.body;
        console.log("added");
        productsCollection.insertMany(events)
        .then(result => {
            res.status(200).send(result.insertedCount)
        })
    })

    app.get('/category', (req, res) => {
        categoriesCollection.find({})
        .toArray((err, documents) => {
            res.status(200).send(documents);
        })
    })

    app.get('/products', (req, res) => {
        productsCollection.find({})
        .toArray((err, documents) => {
            res.status(200).send(documents);
        })
    })

    app.post('/addCart', (req, res) => {
        const events = req.body;
        console.log(events);
        cartCollection.insertOne(events)
        .then(result => {
          res.status(200).send(result.insertedCount);
        })
    })

    app.get('/cart', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail == queryEmail) {
                    cartCollection.find({email: queryEmail})
                    .toArray((err, documents) => {
                        res.status(200).send(documents);
                    })
                    }
                    else{
                        res.status(401).send('Unauthorized access');
                    }
                    // ...
                }).catch(function (error) {
                    res.status(401).send('Unauthorized access');
                });
        }
        else{
            res.status(401).send('Unauthorized access');
        }
        
    })

    app.delete('/deleteFromCart/:id', (req, res) => {
        cartCollection.deleteOne({_id: req.params.id})
        .then((result) => {
            console.log(result);
        })
    })

    app.post('/addOrder', (req, res) => {
        const events = req.body;
        console.log(events);
        ordersCollection.insertOne(events)
        .then(result => {
          res.status(200).send(result.insertedCount);
        })
    })

    app.get('/orders', (req, res) => {
        ordersCollection.find({})
        .toArray((err, documents) => {
            res.status(200).send(documents);
        })
    })

});


app.get('/', (req, res) => {
    res.send("Hello Server");
})

app.listen(process.env.PORT || port)