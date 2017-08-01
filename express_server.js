const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");

var app = express();

app.set('trust proxy', 1);
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'user_id',
  keys : ['key1','key2'],
  maxAge: 24 * 60 * 60 * 1000, 
}));
app.use(bodyParser.urlencoded({extended: true}));

const PORT = process.env.PORT || 8080; // default port 8080


function generateRandomString() {
    return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

var urlDatabase = {
};

const users = { 
}

app.get("/", (req, res) => {  
  res.redirect("/urls");
});

//Login routes
app.get("/login", (req, res) => {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("login",templateVars);
});


app.post("/login", (req, res) => {
  let userMatch = false;
  let passMatch = false
  for(x in users){
    if(users[x].email === req.body.username){
      userMatch = true
      if(bcrypt.compareSync(req.body.password, users[x].password)){
        passMatch = true;
        req.session.user_id =  x;     
      }
    }
  }
  if(!userMatch){
    res.status(403).send('User not found');
  }else if(!passMatch){
    res.status(403).send('Password does not match');
  }
  res.redirect('/urls'); 
});

app.post("/logout", (req, res) => {
  req.session = null; 
  res.redirect('/urls'); 
});


//Registration routes
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.id };
    res.render("register",templateVars);
});

app.post("/register", (req, res) => {
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
    req.session.user_id = userid
    res.redirect('/urls');
  }
});

//Routes for getting and setting urls - must be logged in
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Shows users urls
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };
  for(x in urlDatabase){
    if (req.session.user_id === x){
      templateVars['urls'] = urlDatabase[x];
    }
  }
  res.render("urls_index",templateVars)
});

//new url page
app.get("/urls/new", (req, res) => {
    let templateVars =  {
      user: users[req.session.user_id],
      res:res
    };
  res.render("urls_new",templateVars);
});

//Creates a url
app.post("/urls/new", (req, res) => {
  var id = generateRandomString();
  urlDatabase[req.session.user_id][id] = req.body.longURL;
  res.redirect('/urls');
});

//Id specific url page - can change long url here
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.id };
  res.render("urls_show", templateVars);
});

//Change the long url of a chosen url
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.session.user_id][req.params.id] = req.body.longURL
  res.redirect('/urls')
});

//Delete a url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.session.user_id][req.params.id];
  res.redirect('/urls');
});

//Go to the expanded url - can be done by any one and while logged out
app.get("/u/:shortURL", (req, res) => {
  let longURL;
  for(x in urlDatabase){
    for (y in urlDatabase[x]){
      if(y === req.params.shortURL){
        longURL = urlDatabase[x][req.params.shortURL];
      }
    }
  }
  res.redirect(longURL.search('http') ? `https://${longURL}` : longURL);
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});