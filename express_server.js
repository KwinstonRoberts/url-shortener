var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());



function generateRandomString() {
    return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars =  { urls:urlDatabase };
  templateVars['username'] = req.cookies["username"];
  res.render("urls_index",templateVars)
});

app.get("/urls/new", (req, res) => {
    let templateVars =  {username: req.cookies["username"]};
    templateVars['username'] = req.cookies["username"];
  res.render("urls_new",templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"] ? req.cookies['username'] : '',
    shortURL: req.params.id };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params.id);
  delete urlDatabase[req.params.id]
  res.redirect('/urls');
});
app.post("/login", (req, res) => {
  console.log(req.body);
  res.cookie('username',req.body.username);
  res.redirect('/urls');  
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');  
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});