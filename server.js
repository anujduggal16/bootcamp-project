const express = require('express')
const app = express()
const mysql = require('mysql2')
const bodyParser = require('body-parser');

  
const connection = mysql.createConnection({
  host: 'sql12.freemysqlhosting.net',
  user: 'sql12246465',
  password: '1Eil1Ee7Xc',
  database: 'sql12246465'
})

app.use( express.static('public') ) ;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}) );

app.all("/*", function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
});

//registers new user
app.post('/new', function (req, res) {

  //generate a secret random key for every new user which helps in session handling 
  require('crypto').randomBytes(48, function(err, buffer) {
   var token = buffer.toString('hex');
   connection.query(`INSERT INTO users (username, email , mobile, city, password, secret)
  VALUES (?, ?, ?, ?, ?, ? )`,
 [req.body.username,req.body.email, req.body.contact, req.body.city,req.body.password,token],
function(err , results , fields){
  if (results == undefined){
    res.send(JSON.stringify({ status: "false" }))
   }
   else{
    res.send(JSON.stringify({ status: "true" }))
   }
});
  });     
});

//login
app.post('/login', function (req, res) {
  
connection.query(`SELECT * FROM users WHERE email = ?`,[req.body.email],
function(err,results,fields){
  if(err)
  {
    console.log(err);
  }
  if (results.length == 0){    
    res.send(JSON.stringify({ status: "falseemail" }))
   }
   else{
    connection.query(`SELECT password FROM users WHERE email = ? ` , [req.body.email],
    function(err , results , fields ) {
      if (results[0].password == req.body.password){
       res.send(JSON.stringify({ status: "true" }))
      }
      else{
       res.send(JSON.stringify({ status: "false" }))
      }
     
    });
   }
});
});

//get data of current user
app.post('/getuserdata',function(req,res){
  connection.query(`SELECT *  FROM users WHERE email = ?` , [req.body.email],
  function(err , results , fields ) {
    if (err) {
      console.log(err) ;
    }
    else{
     res.json(results) ;
    }
});
});

//get name of current user
app.post('/getname',function(req,res){
  connection.query(`SELECT username  FROM users WHERE email = ?` , [req.body.email],
  function(err , results , fields ) {
    if (err) {
      console.log(err) ;
    }
    else{
     res.json(results[0]) ;
    }
});
});

//fetch all books listed
app.get('/getlistings',function(req,res){
  connection.query(`SELECT * FROM  listings`,   
  function(err , results , fields ) {
    if (err) {
      console.log(err) ;
    }
    else{
      if(results.length == 0){
        res.send(JSON.stringify({ status: "false" }))
      }
      else{
     res.json(results) ;
    }
  }
});
});

//fetch details of a book when id is given
app.post('/getbookdetails',function(req,res){
  connection.query(`SELECT * FROM listings WHERE id = ?` , [req.body.id],
  function(err , results , fields ) {
    if (err) {
      console.log(err) ;
    }
    else{
     res.json(results[0]) ;
    }
});
});

//fetch details of a book when condition is given
app.post('/filterbooks',function(req,res){
  console.log("server")
  connection.query(`SELECT * FROM listings WHERE book_condition = ?` , [req.body.condition],
  function(err , results , fields ) {
    if (err) {
      console.log(err) ;
    }
    
    else{
      console.log(results);
     res.json(results) ;
    }
});
});

//search books
app.post('/search',function(req,res){
  connection.query(`SELECT * FROM listings WHERE bookname LIKE ? OR author LIKE ?`, ['%' + req.body.search + '%','%' + req.body.search + '%'] , 
  function(err , results , fields ) {
    if(err)
    {
      console.log(err);
    }
   else{
     res.json(results);
   }
});
});

//add book to wishlist
app.post('/addtowishlist',function(req,res){

  //check if book already wishlisted 
  connection.query(`SELECT * FROM wishlist  WHERE email=? AND bookid=?`,[req.body.email,req.body.bookid],
function(err,results,fields){
  if (err) {
    console.log(err) ;
  }
  if (results.length != 0){
    res.send(JSON.stringify({ status: "negative" }))
   }
   else{
    connection.query(`INSERT INTO wishlist (email,bookid) VALUES(?,?)` , [req.body.email,req.body.bookid],
    function(err , results , fields ) {
      if (err) {
        console.log(err) ;
      }
      if (results == undefined){
        res.send(JSON.stringify({ status: "false" }))
       }
       else{
        res.send(JSON.stringify({ status: "true" }))
       }
  });
   }
});
});


//get wishlist
app.post('/getwishlist',function(req,res){
  connection.query(`SELECT listings.*
  FROM wishlist 
  INNER JOIN listings ON listings.id = wishlist.bookid  where wishlist.email= ?` , [req.body.email],
  function(err , results , fields ) {
    if (err) {
      console.log(err) ;
    }
    else{
      if(results.length == 0){
        res.send(JSON.stringify({ status: "false" }))
      }
      else{
     res.json(results) ;
    }
    }
});
});

//delete book from wishlist based on bookid
app.post('/deletewishlistid',function(req,res){

    connection.query(`DELETE FROM wishlist  WHERE bookid=?`,[req.body.bookid],
    function(err , results , fields ) {
      if (err) {
        console.log(err) ;
      }
  });
});

//delete book from wishlist
app.post('/deletewishlist',function(req,res){

  connection.query(`DELETE FROM wishlist WHERE email=? AND bookid=?`,[req.body.email,req.body.bookid],
  function(err , results , fields ) {
    if (err) {
      console.log(err) ;
    }
    if (results == undefined){
      res.send(JSON.stringify({ status: "false" }))
     }
     else{
      res.send(JSON.stringify({ status: "true" }))
     }
});
});

//add new book
app.post('/newbook',function(req,res){
  connection.query(`INSERT INTO listings (bookname, author, image, price, book_condition,email)
  VALUES (?, ?, ?, ?, ?, ? )`,
 [req.body.bookname,req.body.author,req.body.image, req.body.price, req.body.condition,req.body.email],
function(err , results , fields){
  if(err){
    console.log(err);
  }
  if (results == undefined){
    res.send(JSON.stringify({ status: "false" }))
   }
   else{
    res.send(JSON.stringify({ status: "true" }))
   }
});
});

//get listings of user
app.post('/getmylistings',function(req,res){
  connection.query(`SELECT * FROM listings WHERE email=?`, [req.body.email],
  function(err , results , fields ) {
    if (err) {
      console.log(err) ;
    }
    else{
      if(results.length == 0){
        res.send(JSON.stringify({ status: "false" }))
      }
      else{
     res.json(results) ;
    }
    }
});
});

//delte book from wishlist
app.post('/deletelisting',function(req,res){

  connection.query(`DELETE FROM listings WHERE email=? AND id=?`,[req.body.email,req.body.bookid],
  function(err , results , fields ) {
    if (err) {
      console.log(err) ;
    }
    if (results == undefined){
      res.send(JSON.stringify({ status: "false" }))
     }
     else{
      res.send(JSON.stringify({ status: "true" }))
     }
});
});

//sendmessage
app.post('/sendmessage',function(req,res){
  connection.query(`INSERT INTO messages (sender, senderemail, receiver, receiveremail, message, date)
  VALUES (?, ?, ?, ?, ?, ? )`,
 [req.body.sender,req.body.senderemail,req.body.receiver, req.body.recvemail, req.body.message, req.body.date],
function(err , results , fields){
  if(err){
    console.log(err);
  }
  if (results == undefined){
    res.send(JSON.stringify({ status: "false" }))
   }
   else{
    res.send(JSON.stringify({ status: "true" }))
   }
});
});

//get messages of user
app.post('/getmessages',function(req,res){
  connection.query(`SELECT *  FROM messages WHERE senderemail = ? OR receiveremail = ?` , [req.body.email,req.body.email],
  function(err , results , fields ) {
    if (err) {
      console.log(err) ;
    }
    else{
     res.json(results) ;
    }
});
});

let port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000
let ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

app.listen(port,ip, function () {
  console.log("Express server listening on port %d in %s mode", port , ip);
  console.log('Example app listening on port 3000!')
})