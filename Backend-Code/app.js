
const express = require('express');
const mongoose = require('mongoose');
const cors= require("cors");


const routes = require('./Routers/index');

const host = "localhost";
const port = 8900;



const app = express();
app.use(express.json());

app.use(cors());


app.use('/',routes);


mongoose.connect("mongodb+srv://Zoufisha:Zoufi2021@cluster0.40etm.mongodb.net/DB-1?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(port, host, () => {
            console.log(`Server running at ${host}:${port}`);
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });
