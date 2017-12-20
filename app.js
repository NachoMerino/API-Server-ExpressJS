const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql');
const os = require('os');
const bodyParser = require('body-parser');
const app = express();
const Router = express.Router;


const port = 9090;

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'qwerty',
  database: 'online_shop'
});

const frontendDirectoryPath = path.resolve(__dirname, './../static');

console.info('Static resource on: ', frontendDirectoryPath);
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(frontendDirectoryPath));
// CORS on ExpressJS to go over the port limitations on the same machine
app.use(cors());

const apiRouter = new Router();
app.use('/api', apiRouter);

apiRouter.get('/', (req, res) => {
  res.send({ 'shop-api': '1.0' });
});

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
        res.render('index', { serverIP: iface.address });
      });
    }
    ++alias;
  });
});

///Conect to MySQL
apiRouter.get('/products', (req, res) => {
  con.query('select * from products', (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.type('json');
      res.send(rows);
    }
  });
});

apiRouter.get('/categories', (req, res) => {
  con.query('select * from product_categories', (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.type('json');
      res.send(rows);
    }
  });
});
///MySQL END

///MySQL END
apiRouter.get('/activecustomers', (req, res) => {
  con.query('select id from customers where active = 1 ', (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.json(rows);
    }
  });
});

apiRouter.get('/customers/:userid', (req, res) => {
  con.query('select * from customers where active = 1 and id = ?', [req.params.userid], (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.json(rows);
    }
  });
});

apiRouter.get('/payment_methods', (req, res) => {
  con.query('SELECT * FROM payment_methods', (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.json(rows);
    }
  });
});

apiRouter.put('/activate/:userid', (req, res) => {
  con.query('UPDATE customers set active = ? where id = ?', [req.body.status, req.params.userid],
    (err, rows) => {
      if (err)
        throw err;
      res.json(rows);
    });
});
// postUser.sh
apiRouter.post('/user', (req, res) => {

  con.query('select email from customers where email = ?', [req.body.email],
    function(err, rows) {
      if (err)
        throw res.json();
      if (rows.length > 0) {
        res.json('The email ' + [req.body.email] + ' its already in use.');
      } else {
        con.query('INSERT INTO customers (firstname,lastname,birthdate,phone,city,street,postal,email) VALUES (?,?,?,?,?,?,?,?)', [req.body.firstname,
            req.body.lastname,
            req.body.birthdate,
            req.body.phone,
            req.body.city,
            req.body.street,
            req.body.postal,
            req.body.email
          ],
          (err, rows) => {
            if (err) {
              throw err;
            } else {
              res.json(rows);
            }
          });
      }
    });
});
//postOrder.sh
apiRouter.post('/order', (req, res) => {
  /*
  fs.writeFile(path.resolve(__dirname, './../../orders/orders'+Date.now()+'.txt'), JSON.stringify(req.body),
    (err)=>{
      if(err)
        res.json({error: err});
      res.json({success:'order saved'})
    });
    */
  con.query('INSERT INTO orders (customer_id,created,payment_method_id) VALUES (?,now(),?)', [req.body.customer_id, req.body.payment_method_id],
    (err, rows) => {
      if (err) {
        throw err;
      } else {
        con.query('INSERT INTO order_details (order_id,product_id,price) VALUES (' + rows.insertId + ',?,?)', [req.body.product_id, req.body.price],
          (err, rows) => {
            if (err) {
              throw err;
            } else {
              res.json(rows);
            }
          });
      }
    });
});
// modifyUser.sh
apiRouter.put('/user/:userid', (req, res) => {
  var sql = 'UPDATE customers set ';
  // console.info('user id: ', req.params.userid);
  var i = 1;
  var bodyLength = Object.keys(req.body).length;
  var values = [];
  for (var field in req.body) {
    sql += field + ' = ?';
    if (i < bodyLength)
      sql += ',';
    i++;
    values.push(req.body[field]);
    // console.info('field is:',field);
    // console.info('value is:',req.body[field]);
  }
  sql += 'where id = ?';
  values.push(req.params.userid);
  con.query(sql, values,
    (err, rows) => {
      if (err)
        throw err;
      res.json(rows);
    });
});

apiRouter.delete('/delete/:userid', (req, res) => {
  con.query('UPDATE customers set deleted = now() where id = ?', [req.params.userid],
    (err, rows) => {
      if (err)
        throw err;
      res.json(rows);
    });
});

// Redirecting a 404 Error
app.get("*", (req, res) => {
  res.render('404');
});

app.listen(port, (err) => {
  if (err) throw err;
  console.info('Server started on port', port);
});
