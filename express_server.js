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


// PSEUDO DATABASE

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 
}


//HOMEPAGE

app.get("/urls", (req, res) => {
 
  const currentUser = users[req.cookies.user_id];
 
  const templateVars = { user: currentUser,
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.post("/urls", (req, res) => {

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});


//CREATE NEW URL

app.get("/urls/new", (req, res) => {

  const currentUser = users[req.cookies.user_id];
 
  const templateVars = { user: currentUser,
    urls: urlDatabase };

  res.render("urls_new", templateVars);
});



//SHOW URLS

app.get("/urls/:shortURL", (req, res) => {

  const currentUser = users[req.cookies.user_id];
 
  const templateVars = {user: currentUser,
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  urlDatabase[templateVars];

  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {

  
 
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



//LOGIN

app.post("/urls/login", (req, res) => {
  
  const username = req.body.username;

  let cookie = res.cookie('user', username);
  console.log('Cookies: ', cookie.req.body.username);
  res.redirect('/urls');

});

//REGISTER WITH USERNAME & PASSWORD

app.get("/register", (req, res) => {

  res.render('register');
});


app.post("/register", (req, res) => {

const id = generateRandomString();

users[id] = {
  id: id,
  email: req.body.email,
  password: req.body.password
}

let cookieID = res.cookie('user_id', id);

res.redirect('/urls');
});


//LOGOUT

app.post("/urls/logout", (req, res) => {

  res.clearCookie('user');
  res.redirect('/urls');

});


//EDIT URL

app.post("/urls/:shortURL/edit", (req, res) => {


  
  const newURL = req.body.longURL;
  urlDatabase[req.params.shortURL] = newURL;
 
  res.redirect('/urls');



});



//DELETE URL

app.post("/urls/:shortURL/delete", (req, res) => {

  console.log(req.params);
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');

});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





