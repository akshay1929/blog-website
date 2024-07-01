require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const connectDB = require('./server/config/db');
const app = express();
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const port = process.env.PORT || 3000;

app.use(express.static('public'));

//Conect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: 'false',
  savedUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL
  })
}));

//Template Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});