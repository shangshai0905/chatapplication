const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const app = express();
const port = 5005;
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const cors = require('cors');

dotenv.config({
  path: './.env'
});


const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DATABASE_PORT
});

db.connect((err) => {
  if (err) {
    console.log("Error: " + err);
  } else {
    console.log("Database Connected");
  }
});


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

const messageRouter = require('./routes/message');
app.use('/messages', messageRouter);

const messagesRouter = require('./routes/message');
app.use('/messages', messagesRouter);



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
