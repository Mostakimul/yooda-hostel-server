const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');

app.use(cors());
app.use(express.json());
dotenv.config();

// Mongo Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@sandbox.5jrgy.mongodb.net/yooda?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// All async function
async function run() {
  try {
    await client.connect();
    const database = client.db('yooda');
    const foodCollection = database.collection('foodItem');
    const studentCollection = database.collection('student');
    const distributionCollection = database.collection('distribution');

    // Save food to mongo
    app.post('/foods', async (req, res) => {
      const foods = req.body;
      const result = await foodCollection.insertOne(foods);
      res.json(result);
    });

    // Fetch all foods
    app.get('/foods', async (req, res) => {
      const cursor = foodCollection.find({});
      const count = await cursor.count();

      const page = req.query.page;
      const size = parseInt(req.query.size);

      let result;
      if (page) {
        result = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        result = await cursor.toArray();
      }

      res.json({
        result,
        count,
      });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello From Niche Server!');
});

app.listen(port, () => {
  console.log('Listening to port: ', port);
});
