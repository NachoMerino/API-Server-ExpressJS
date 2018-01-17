const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql');
const os = require('os');
const osu = require('os-utils');
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt');
const Router = express.Router;

const port = 9090;

let osFolder = process.env.HOME + '/.status_login';
let statusConfig = null;
if (!fs.existsSync(osFolder)) {
  fs.mkdirSync(osFolder);
  let initialConfig = {
    mysql_user: '',
    mysql_db: '',
    mysql_pwd: '',
  }
  fs.writeFileSync(osFolder + '/.config.json', JSON.stringify(initialConfig));
  console.log('The config folder does not exist, it has been created now. The server will exit now');
  process.exit();

} else {
  statusConfig = require(osFolder + '/.config.json');
}

// you need to access /home/"yourUserName"/.status_login/.config.json and set the DB data
const con = mysql.createConnection({
  host: 'localhost',
  user: statusConfig.mysql_user,
  password: statusConfig.mysql_pwd,
  database: statusConfig.mysql_db,
});


// diskUsage in Bytes (1 Byte 1e-9 GB) make it
const disk = require('diskusage');
// socket.io
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

// CORS on ExpressJS to go over the port limitations on the same machine
app.use(cors());

app.use(express.static(__dirname + '/bower_components'));
app.get('/status', function(req, res, next) {
  let way = os.platform() === 'win32' ? 'c:' : '/';
  disk.check(way, function(err, info) {
    if (err) {
      console.log(err);
    } else {
      const availableHDD = Math.round(info.available * 1e-9);
      const freeHDD = Math.round(info.free * 1e-9);
      const totalHDD = Math.round(info.total * 1e-9);
      
      res.render('usage', {
        hostName: os.hostname(),
        platform: os.type(),
        cpuModel: os.cpus()[0]['model'],
        numberCpus: os.cpus().length,
        totalMem: osu.totalmem(),
        totalHDD: totalHDD,
        freeHDD: freeHDD,
        availableHDD: availableHDD,
      });
    }
  });

});

io.on('connection', function(client) {
  console.log('One client is connected');
  // send data every second without reload the page
  setInterval(function() {
    client.emit('ramUsageFree', osu.freememPercentage() * 100);
  }, 1000);
  setInterval(function() {
    client.emit('ramFree', osu.freemem() * 100);
  }, 1000);
  setInterval(function() {
    client.emit('upTime', osu.sysUptime());
  }, 1000);
  setInterval(function() {
    client.emit('ramPercent', osu.freememPercentage());
  }, 1000);
  setInterval(function() {
    osu.cpuUsage(function(v) {
      client.emit('cpu', v);
    });
  }, 1000);

  client.on('join', function(data) {
    console.log(data);
    client.emit('ramUsageFree', osu.freememPercentage() * 100);
  });
});
// socket.io

const frontendDirectoryPath = path.resolve(__dirname, './../static');
app.set('view engine', 'ejs');
app.use('/assets', express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(express.static(frontendDirectoryPath));

console.info('Static resource on: ', frontendDirectoryPath);




const apiRouter = new Router();
app.use('/api', apiRouter);

// Add the current IP to the Index of the server
const ifaces = os.networkInterfaces();
Object.keys(ifaces).forEach((ifname) => {
  let alias = 0;
  ifaces[ifname].forEach((iface) => {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }
    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.info(`The IP address is: ${iface.address} connected via ${ifname} `);
      app.get('/', (req, res) => {
        res.render('login-Screen', {
          serverIP: iface.address,
          hostName: os.hostname(),
        });
      });
      apiRouter.get('/', (req, res) => {
        res.render('index', {
          serverIP: iface.address,
          hostName: os.hostname(),
        });
      });
    }
    ++alias;
  });
});



// Redirecting a 404 Error
app.get("*", (req, res) => {
  res.render('404', {
    hostName: os.hostname()
  });
});

server.listen(port, (err) => {
  if (err) throw err;
  console.info('Server started on port', port);
});
