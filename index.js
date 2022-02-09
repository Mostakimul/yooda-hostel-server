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

    // Save students to mongo
    app.post('/students', async (req, res) => {
      const students = req.body;
      const result = await studentCollection.insertOne(students);
      res.json(result);
    });

    // Fetch all students
    app.get('/students', async (req, res) => {
      const cursor = studentCollection.find({});
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

    // Delete a students
    app.delete('/students/:id', async (req, res) => {
      const stdId = req.params.id;
      const query = { _id: ObjectId(stdId) };
      const result = await studentCollection.deleteOne(query);
      res.json(result);
    });

    // Delete multiple students
    app.post('/multi', async (req, res) => {
      const idArray = req.body;

      let result;
      idArray.forEach(async (id) => {
        const query = { _id: ObjectId(id) };
        result = await studentCollection.deleteOne(query);
      });
      res.json(result);
    });

    // Change student status
    app.post('/status', async (req, res) => {
      const idArray = req.body;
      let result;

      idArray.forEach(async (st) => {
        let newArr = st.split(',');
        const filter = { _id: ObjectId(newArr[0]) };
        const options = { upsert: true };

        let newStat = newArr[1] === 'active' ? 'inActive' : 'active';
        console.log(newStat);

        const updateDoc = {
          $set: {
            status: newStat,
          },
        };
        result = await studentCollection.updateOne(filter, updateDoc, options);
      });
      res.send(result);
    });

    // fetch single student
    app.get('/students/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await studentCollection.findOne(query);
      res.json(result);
    });

    // Edit student
    app.put('/students/:id', async (req, res) => {
      const id = req.params.id;
      const updatedStudent = req.body;

      console.log('ID', id);
      console.log('updatedStudent', updatedStudent);

      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          fullName: updatedStudent.fullName,
          roll: updatedStudent.roll,
          age: updatedStudent.age,
          stclass: updatedStudent.stclass,
          status: updatedStudent.status,
        },
      };
      const result = await studentCollection.updateOne(
        filter,
        updateDoc,
        options,
      );
      res.send(result);
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
