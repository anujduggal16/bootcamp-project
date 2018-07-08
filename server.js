const express = require('express')
const app = express()
const mysql = require('mysql2')

  
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pass',
  database: 'project'
})

app.use( express.static('public') ) ;

app.use(express.json());
app.use(express.urlencoded({extended: true}) );

app.all("/*", function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
});

//register new user
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
connection.query(`SELECT * FROM USERS WHERE email = ?`,[req.body.email],
function(err,results,fields){
  if (results.length == 0){    
    res.send(JSON.stringify({ status: "falseemail" }))
   }
   else{
    connection.query(`SELECT password FROM USERS WHERE email = ? ` , [req.body.email],
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
  connection.query(`SELECT *  FROM USERS WHERE email = ?` , [req.body.email],
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
  connection.query(`SELECT username  FROM USERS WHERE email = ?` , [req.body.email],
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
  connection.query(`SELECT * FROM   LISTINGS`,   
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
  connection.query(`SELECT * FROM LISTINGS WHERE id = ?` , [req.body.id],
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
  connection.query(`SELECT * FROM LISTINGS WHERE book_condition = ?` , [req.body.condition],
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
  connection.query(`SELECT * FROM WISHLIST  WHERE email=? AND bookid=?`,[req.body.email,req.body.bookid],
function(err,results,fields){
  if (err) {
    console.log(err) ;
  }
  if (results.length != 0){
    res.send(JSON.stringify({ status: "negative" }))
   }
   else{
    connection.query(`INSERT INTO WISHLIST (email,bookid) VALUES(?,?)` , [req.body.email,req.body.bookid],
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
  connection.query(`SELECT LISTINGS.*
  FROM WISHLIST
  INNER JOIN LISTINGS ON LISTINGS.id = WISHLIST.bookid  where WISHLIST.email= ?` , [req.body.email],
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

    connection.query(`DELETE FROM WISHLIST WHERE bookid=?`,[req.body.bookid],
    function(err , results , fields ) {
      if (err) {
        console.log(err) ;
      }
  });
});

//delete book from wishlist
app.post('/deletewishlist',function(req,res){

  connection.query(`DELETE FROM WISHLIST WHERE email=? AND bookid=?`,[req.body.email,req.body.bookid],
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
  connection.query(`INSERT INTO LISTINGS (bookname, author, image, price, book_condition,email)
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
  connection.query(`SELECT * FROM LISTINGS WHERE email=?`, [req.body.email],
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

  connection.query(`DELETE FROM LISTINGS WHERE email=? AND id=?`,[req.body.email,req.body.bookid],
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
  connection.query(`INSERT INTO MESSAGES (sender, senderemail, receiver, receiveremail, message, date)
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
  connection.query(`SELECT *  FROM MESSAGES WHERE senderemail = ? OR receiveremail = ?` , [req.body.email,req.body.email],
  function(err , results , fields ) {
    if (err) {
      console.log(err) ;
    }
    else{
     res.json(results) ;
    }
});
});

let port = process.env.port | 3000
let ip = process.env.ip | '127.0.0.1'

app.listen(port,ip, function () {
  console.log('Example app listening on port 3000!')
})