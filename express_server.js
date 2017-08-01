var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());



function generateRandomString() {
    return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

var urlDatabase = {
  "userRandomID":{
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars={
    res:res,
    user: users[req.cookies["user_id"]],
    urls:{}
  };
  for(x in urlDatabase){
    if (req.cookies['user_id']===x){
      templateVars['urls'] = urlDatabase[x];
    }
  }
  res.render("urls_index",templateVars)
});

app.get("/urls/new", (req, res) => {
    let templateVars =  {
      user: users[req.cookies["user_id"]],
      res:res
    };
  res.render("urls_new",templateVars);
});

app.post("/urls/new", (req, res) => {
  var id = generateRandomString();
  console.log(urlDatabase[req.cookies.user_id])
  urlDatabase[req.cookies['user_id']][id] = req.body.longURL;
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let longURL;
  for(x in urlDatabase){
    for (y in urlDatabase[x]){
      if(y===req.params.shortURL){
        longURL = urlDatabase[x][req.params.shortURL];
      }
    }
  }
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.id };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.cookies.user_id][req.params.id] = req.body.longURL
  res.redirect('/urls')
});


app.get("/register", (req, res) => {
    let templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render("register",templateVars);
});

app.post("/register", (req, res) => {
  console.log(req.body);
  if(!req.body.password || !req.body.username){
    for(x in users){
      if(users[x].email === req.body.username){
        res.status(400).send("email exists");
        throw "error occurred";
      }
    }
    res.status(400).send('empty form field');
    throw "error occurred";
    }else{
      var userid = generateRandomString();
      users[userid] = {
        id: userid,
        email: req.body.username,
        password: bcrypt.hashSync(req.body.password,10)
      };
      urlDatabase[userid] = {};
      console.log(users);
    res.cookie('user_id',userid)
    res.redirect('/urls');
  }
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params.id);
  delete urlDatabase[req.cookies.user_id][req.params.id];
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
    let templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render("login",templateVars);
});

app.post("/login", (req, res) => {
  console.log(req.body);
  let userMatch = false;
  for(x in users){
    if(users[x].email===req.body.username){
      userMatch = true
      if(bcrypt.compareSync(req.body.password, users[x].password)){
        res.cookie('user_id',x);
      }else{
        res.status(403).send('Password does not match');
      }
    }
  }
  if(!userMatch){
    res.status(403).send('User not found');
  }else{
    res.redirect('/urls'); 
  } 
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');  
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});