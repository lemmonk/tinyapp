const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


//HELPER FUNCTIONS

const generateRandomString = () => {

  return Math.random().toString(36).substring(2, 8);
};

const validateUser = (email, password) => {

  if (!email || !password) {
    return false;
  }

  for (const user in users) {
  
    if (email === users[user].email || password === users[user].password) {
      console.log('user exist');
      return false;
    }

  }


  return true;

};

const validateLogin = (res, req) => {

  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return false;
  }

  for (const user in users) {
  
    if (email === users[user].email & password === users[user].password) {
      users[user].id = user;
      let cookieID = res.cookie('user_id', user);
      return true;
    }

  }


  return false;

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
 
};


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





//REGISTER WITH USERNAME & PASSWORD

app.get("/register", (req, res) => {

  res.render('register');
});


app.post("/register", (req, res) => {

  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  const validate = validateUser(email,password);

  if (validate) {

    users[id] = {
      id: id,
      email: email,
      password: password
    };

    let cookieID = res.cookie('user_id', id);
    res.redirect('/urls');

  } else {
    res.redirect('/error404');
  }

});


//LOGIN


app.get("/login", (req, res) => {

  res.render('login');
});

app.post("/login", (req, res) => {
  

  const validate = validateLogin(res, req);


  if (validate) {

    
    res.redirect('/urls');

  } else {

    res.redirect('/error403');
  }

 
});




//LOGOUT

app.post("/urls/logout", (req, res) => {

  res.clearCookie('user_id');
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


//ERROR HANDLERS

app.get("/error403", (req, res) => {

  res.render('error403');
});




app.get("/error404", (req, res) => {

  res.render('error404');
});



//LISTENING...

app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});





