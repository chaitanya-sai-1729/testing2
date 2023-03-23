const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const cors = require("cors");
app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}));


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://chaitanyasaim5:Ms.dhoni07@booksdb.wwysrlp.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect();



app.post("/stock",async(req,res)=>{
    const nod = req.body.nod;
    const nof = req.body.nof;
    const nom = req.body.nom;
    const buffer = req.body.buffer;
    
    const collection = client.db().collection("inventory");

    try{
        await collection.insertOne({nod:nod,nof:nof,nom:nom,buffer:buffer});
        res.send("Succesfully Posted");
    }catch(e){
        console.log(e);
        
    }

})

app.get("/stock",async(req,res)=>{
    
    const collection = client.db().collection("inventory");
    const findResult = await collection.find({}).toArray();
    res.send(findResult)
    
})



app.listen(3000,()=>{
    console.log("Backend running");
})
