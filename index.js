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
    var stock = req.body.stock;
    var array=stock.split(',');
    const nod = parseInt(sarray[0]);
    const nof = parseInt(array[1]);
    const nom = parseInt(array[2]);
    const buffer = parseInt(req.body.buffer);
    
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

app.post("/stage1",async(req,res)=>{
    const _id=req.body.rfid;

    const collection = client.db().collection("product");

    try{
        await collection.insertOne({_id:_id,stage_1:1,stage_2:0,stage_3:0});
        res.send("Succesfully posted");
    }catch(e){
        console.log(e);
    }

    
})

app.post("/stage2",async(req,res)=>{
    const rfid = req.body.rfid;

    const collection = client.db().collection("product");

    try{
        await collection.updateOne({ _id:rfid }, { $set: { stage_1:0, stage_2:1,stage_3:0 } });
        res.send("Succesfully posted");
    }catch(e){
        console.log(e);
    }
})

app.post("/stage3",async(req,res)=>{
    const rfid = req.body.rfid;

    const collection = client.db().collection("product");

    try{
        await collection.updateOne({ _id:rfid }, { $set: { stage_1:0, stage_2:0,stage_3:1 } });
        res.send("Succesfully posted");
    }catch(e){
        console.log(e);
    }
})

app.get("/number",async(req,res)=>{
    const collection = client.db().collection("product");

    try{
        const array1=await collection.find({stage_1:1}).toArray();
        const array2=await collection.find({stage_2:1}).toArray();
        const array3=await collection.find({stage_3:1}).toArray();

        res.json({stage_1:array1.length,stage_2:array2.length,stage_3:array3.length});
    }catch(e){
        console.log(e);
    }
})


app.listen(3000,()=>{
    console.log("Backend running");
})
