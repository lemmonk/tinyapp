const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
// const { delete } = require("request-promise-native");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateRandomString = () => {

  return Math.random().toString(36).substring(2, 8);
};



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["user"],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {

  const shortURL = generateRandomString();

 


  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {

  const templateVars = { username: req.cookies["user"],
    urls: urlDatabase };

  res.render("urls_new", templateVars);
});





app.get("/urls/:shortURL", (req, res) => {
 
  const templateVars = {username: req.cookies["user"],
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  urlDatabase[templateVars];

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {

  
 
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.post("/urls/login", (req, res) => {
  
  const username = req.body.username;
  // console.log(username);
  let cookie = res.cookie('user', username);
  console.log('Cookies: ', cookie.req.body.username);
  res.redirect('/urls');



});

app.post("/urls/logout", (req, res) => {

  res.clearCookie('user');
  res.redirect('/urls');

});


app.post("/urls/:shortURL/edit", (req, res) => {


  
  const newURL = req.body.longURL;
  urlDatabase[req.params.shortURL] = newURL;
 
  res.redirect('/urls');



});




app.post("/urls/:shortURL/delete", (req, res) => {

  console.log(req.params);
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');

});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





