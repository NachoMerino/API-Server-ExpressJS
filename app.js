const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// JSON file path
const shopDB = require('./public/jsonfiles/shop-database.json');
const shopCategories = require('./public/jsonfiles/shop-categories.json');

app.use(bodyParser());
app.use('/assets', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');


// CORS on ExpressJS to go over the port limitations on the same machine
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get("/database", function(req, res, next) {
  res.json(shopDB);
});
app.get("/categories", function(req, res, next) {
  res.json(shopCategories);
});

// Redirecting a 404 Error
app.get("*", (req, res) => {
  res.render('404');
});

app.listen(port, ()=>{
  console.info('server runs at port: ', port);
})

