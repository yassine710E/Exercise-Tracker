const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); // Generate unique IDs

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// In-memory data storage
let users = [];
let exercises = [];

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// POST endpoint to create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const userId = uuidv4(); // Generate unique ID for user
  const newUser = { username, _id: userId };
  
  users.push(newUser);
  res.json(newUser);
});

// GET endpoint to retrieve all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// POST endpoint to log an exercise for a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;
  const user = users.find((u) => u._id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const exerciseDate = date ? new Date(date) : new Date();
  const newExercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
    _id: userId
  };

  exercises.push(newExercise);
  res.json(newExercise);
});

// GET endpoint to retrieve a user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  const user = users.find((u) => u._id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let userExercises = exercises.filter((ex) => ex._id === userId);

  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter((ex) => new Date(ex.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter((ex) => new Date(ex.date) <= toDate);
  }
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  const responseLog = {
    username: user.username,
    count: userExercises.length,
    _id: userId,
    log: userExercises.map(({ description, duration, date }) => ({ description, duration, date }))
  };

  res.json(responseLog);
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
