const express = require("express");
const app = express();
const PORT = 8080;
const helpers = require('./helpers');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');


//MIDDLEWARE

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'key3'],
}));


// PSEUDO DATABASES

const urlDatabase = {};
const users = {};


//HOMEPAGE

app.get("/", (req, res) => {
 
  const currentUser = users[req.session.userId];
  
  if (currentUser) {
    res.redirect("/urls");
  } else {
    res.render('login');
  }

});



//URL'S MAIN PAGE

app.get("/urls", (req, res) => {
 
  const currentUser = users[req.session.userId];
  const userUrls = helpers.urlsForUser(currentUser, urlDatabase);


  const templateVars = {
    user: currentUser,
    urls: userUrls
  };
  
  res.render("urls_index", templateVars);
});


//NEW URL'S

app.get("/urls/new", (req, res) => {

  const currentUser = users[req.session.userId];

  if (currentUser) {

    const templateVars = {
      user: currentUser,
      urls: urlDatabase,
    };

    res.render("urls_new", templateVars);

  } else {

    res.redirect('/login');
  }

});


app.post("/urls/new", (req, res) => {

  const shortURL = helpers.generateRandomString();


  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.userId,
  };
  

  res.redirect(`/urls/${shortURL}`);
});



//SHORT URL'S

app.get("/urls/:shortURL", (req, res) => {

  const currentUser = users[req.session.userId];
  const urlID = req.params.shortURL;

  let templateVars = {
    errMsg: null,
  };


  if (!urlDatabase[urlID]) {

    templateVars = {
      user: null,
      shortURL: '',
      longURL: "N/A",
      errMsg: "The provided short URL does not exist 🙁"
    };
    return res.render('urls_show', templateVars);
  }

  if (!currentUser) {

    templateVars = {
      user: null,
      shortURL: urlID,
      longURL: urlDatabase[urlID].longURL,
      errMsg: "You are not logged in 🤨"
    };
    return res.render('urls_show', templateVars);
  }


  if (currentUser.id !== urlDatabase[urlID].userID) {

    templateVars = {
      user: currentUser,
      shortURL: urlID,
      longURL: urlDatabase[urlID].longURL,
      errMsg: "This is not your URL 🤔"
    };
    return res.render('urls_show', templateVars);


  }

  if (currentUser && currentUser.id === urlDatabase[urlID].userID) {

    templateVars = {
      user: currentUser,
      shortURL: urlID,
      longURL: urlDatabase[urlID].longURL,
      errMsg: null
    };
  
    return res.render("urls_show", templateVars);
  
  }

});


//EDIT URL'S

app.post("/urls/:shortURL", (req, res) => {


  const currentUser = users[req.session.userId];

  if (!currentUser) {
    return res.redirect('/urls');
  }

 
  urlDatabase[req.params.shortURL] = {
    longURL: req.body.longURL,
    userID:  req.session.userId,
  };
 

  res.redirect('/urls');

});




//OPEN EXTERNAL LINK FOR LONG URL

app.get("/u/:shortURL", (req, res) => {

  if (!urlDatabase[req.params.shortURL]) {
   
    let templateVars = {
      status: "404",
      errMsg: "Malformed URL"
    };

    res.render('errorDynamic',templateVars);

  } else {

    const longURL = urlDatabase[req.params.shortURL].longURL;

    return res.redirect(longURL);
  }

 

});





//DELETE URL

app.post("/urls/:shortURL/delete", (req, res) => {

  const currentUser = users[req.session.userId];

  let templateVars = {};

  if (!currentUser) {

    templateVars = {
      status: "403",
      errMsg: "You are not currently logged in."
    };

    return res.render('errorDynamic', templateVars);
  }

  if (urlDatabase[req.params.shortURL].userID !== currentUser.id) {

    templateVars = {
      status: "403",
      errMsg: "You do not have permission to alter this URL."
    };

    return res.render('errorDynamic', templateVars);
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');

});





//REGISTER USER

app.get("/register", (req, res) => {

  const currentUser = users[req.session.userId];

  if (currentUser) {
    return res.redirect('/urls');
  }

  res.render('register');
});



app.post("/register", (req, res) => {

  let templateVars = {};
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    templateVars = {
      status: '403',
      errMsg: "Invalid email or password format"
    };

    return res.render('errorDynamic', templateVars);
  }
  
  const validate = helpers.validateUser(email, users);

  if (!validate) {

    const id = helpers.generateRandomString();
    
    bcrypt.genSalt(10, function(err, salt) {

      if (err) {
        return res.redirect('/error404');
      }

      bcrypt.hash(password, salt, function(err, hash) {
  
        if (err) {
          return res.redirect('/error404');
        }
         
        users[id] = {
          id: id,
          email: email,
          password: hash
        };

        
        req.session.userId = id;
       
        res.redirect('/urls');
      });
    });

   

  } else {
    templateVars = {
      status: '403',
      errMsg: "Email already exist"
    };

    res.render('errorDynamic', templateVars);
  }

});


//LOGIN USER

app.get("/login", (req, res) => {

  const currentUser = users[req.session.userId];

  if (currentUser) {
    return res.redirect('/urls');
  }

  res.render('login');
});


app.post("/login", (req, res) => {
  
  let templateVars = {};
  const email = req.body.email;
  const password = req.body.password;


  const validate = helpers.validateUser(email, users);


  if (validate) {

    const hash = validate.password;
    
    bcrypt.compare(password, hash, function(err, result) {
      
      if (err) {
        return res.redirect('/error404');
      }

      if (result) {

        req.session.userId = validate.id;
        return res.redirect('/urls');

      } else {

        templateVars = {
          status: '403',
          errMsg: 'Invalid Credentials'
        };

        res.render('errorDynamic', templateVars);

      }

    });

    
   

  } else {

    templateVars = {
      status: '403',
      errMsg: 'Invalid Credentials'
    };

    res.render('errorDynamic', templateVars);

   
  }

 
});



//LOGOUT

app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect('/urls');

});



//ERROR HANDLER

app.get("*", (req, res) => {

  res.render('error404');
});



//LISTENING...

app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});





