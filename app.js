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

// Add the current IP to the Index of the server
'use strict';

var os = require('os');
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function(ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function(iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.info('the ip address is: ', ifname, iface.address);
      app.get('/', (req, res) => {
        res.render('index', { serverIP: iface.address });
      });
    }
    ++alias;
  });
});

// en0 192.168.1.101
// eth0 10.0.0.101



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

app.listen(port, () => {
  console.info('server runs at port: ', port);
})
