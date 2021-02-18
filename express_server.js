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



const validateRegistration = (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
 
  if (!email || !password) {
    return false;
  }

  for (const user in users) {
  
    if (email === users[user].email) {

      return false;
    }

  }

  const id = generateRandomString();

  users[id] = {
    id: id,
    email: email,
    password: password
  };

  res.cookie('user_id', id);

  return true;

};


const validateLogin = (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
 
  if (!email || !password) {
    return false;
  }


  for (const user in users) {

    if (email === users[user].email && password === users[user].password) {

      res.cookie('user_id', user);
      users[user].id = user;
      return true;
    }

  }

  return false;

};



// PSEUDO DATABASES
// "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"

const urlDatabase = {};



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
  
  const templateVars = {
    user: currentUser,
    urls: urlDatabase };
  
  res.render("urls_index", templateVars);
});


//NEW URL

app.post("/urls", (req, res) => {

  const shortURL = generateRandomString();
  // urlDatabase[shortURL] = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };
  console.log('Obj with Id:', urlDatabase);

  res.redirect(`/urls/${shortURL}`);
});




app.get("/urls/new", (req, res) => {

  const currentUser = users[req.cookies.user_id];

  if (currentUser) {

    const templateVars = {
      user: currentUser,
      urls: urlDatabase };

    res.render("urls_new", templateVars);

  } else {
    res.redirect('/login');
  }

});



//SHOW SHORT URL LINK

app.get("/urls/:shortURL", (req, res) => {

  const currentUser = users[req.cookies.user_id];
 
  const templateVars = {
    user: currentUser,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };

  urlDatabase[templateVars];

  res.render("urls_show", templateVars);
});


//OPEN EXTERNAL LINK FOR LONG URL

app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});





//REGISTER WITH USERNAME & PASSWORD

app.get("/register", (req, res) => {

  res.render('register');
});


app.post("/register", (req, res) => {

  
  const validate = validateRegistration(req, res);

  if (validate) {

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
  

  const validate = validateLogin(req, res);


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





