const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
	"mongodb+srv://chaitanyasaim5:Ms.dhoni07@booksdb.wwysrlp.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});
client.connect();

app.post("/stock", async (req, res) => {
	var stock = req.body.stock;
	var array = stock.split(",");
	const nod = parseInt(array[0]);
	const nof = parseInt(array[1]);
	const nom = parseInt(array[2]);
	const buffer = parseInt(req.body.buffer);

	const collection = client.db().collection("inventory");
	const document = await collection.findOne();

	try {
		if (
			document &&
			(document.nod !== nod || document.nof !== nof || document.nom !== nom)
		) {
			await collection.findOneAndUpdate(
				{ _id: document._id },
				{ $set: { nod: nod, nof: nof, nom: nom, buffer: buffer } }
			);
			io.emit("stock", nod, nof, nom);
		} else {
			await collection.insertOne({ nod, nof, nom, buffer });
			io.emit("stock", nod, nof, nom);
		}
		res.send("Successfully Posted");
	} catch (e) {
		console.log(e);
	}
});

app.get("/stock", async (req, res) => {
	const collection = client.db().collection("inventory");
	const findResult = await collection.findOne();
	res.send({
		...findResult,
	});
});

app.post("/stage1", async (req, res) => {
	const _id = req.body.rfid;

	const collection = client.db().collection("product");

	try {
		await collection.insertOne({ _id: _id, stage_1: 1, stage_2: 0, stage_3: 0 });
		io.emit("stage1");
		res.send("Successfully posted");
	} catch (e) {
		console.log(e);
	}
});

app.post("/stage2", async (req, res) => {
	const rfid = req.body.rfid;

	const collection = client.db().collection("product");

	try {
		await collection.updateOne(
			{ _id: rfid },
			{ $set: { stage_1: 0, stage_2: 1, stage_3: 0 } }
		);
		io.emit("stage2");
		res.send("Successfully posted");
	} catch (e) {
		console.log(e);
	}
});

app.post("/stage3", async (req, res) => {
	const rfid = req.body.rfid;

	const collection = client.db().collection("product");

	try {
		await collection.updateOne(
			{ _id: rfid },
			{ $set: { stage_1: 0, stage_2: 0, stage_3: 1 } }
		);
		io.emit("stage3");
		res.send("Successfully posted");
	} catch (e) {
		console.log(e);
	}
});

app.post("/orders", async (req, res) => {
	const d = req.body.drones;
	const m = req.body.motors;
	const f = req.body.frames;
	console.log(req.body);
	collection = client.db().collection("product");
	const a = await collection.find({ stage_3: 1 }).toArray();

	if (a.length < d) {
		console.log(a);
		res.send({ message: "out of stock" });
	} else {
		for (let i = 0; i < d; i++) {
			await collection.updateOne(
				{ _id: a[i]._id },
				{ $set: { stage_4: 1, stage_3: 0 } }
			);
		}
		res.send({ message: "order successfull" });
	}
});

app.get("/number", async (req, res) => {
	const collection = client.db().collection("product");

	try {
		const array1 = await collection.find({ stage_1: 1 }).toArray();
		const array2 = await collection.find({ stage_2: 1 }).toArray();
		const array3 = await collection.find({ stage_3: 1 }).toArray();

		res.json({
			stage_1: array1.length,
			stage_2: array2.length,
			stage_3: array3.length,
		});
	} catch (e) {
		console.log(e);
	}
});

// Sockets
io.on("connection", (socket) => {
	globalSocket = socket;
	socket.on("chat message", (msg) => {
		console.log("message: " + msg);
	});
});

server.listen(3000, () => {
	console.log("Backend running");
});
