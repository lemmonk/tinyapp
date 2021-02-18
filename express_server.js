const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const helpers = require('./helpers');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const  cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'key3'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


const bcrypt = require('bcryptjs');


//HELPER FUNCTIONS

const generateRandomString = () => {

  return Math.random().toString(36).substring(2, 8);
};

 



// const validateUser = (email, usersDB) => {

  
//   if (!email) {
//     return false;
//   }


//   for (const user in usersDB) {

//     if (email === usersDB[user].email) {
//       const id = usersDB[user].id;
//       console.log('ID: ',id);
//       return id;
//     }

//   }

//   return false;

// };


const urlsForUser = id => {

  const userUrls = {};

  for (const uid in urlDatabase) {
   
    if (id && urlDatabase[uid].userID === id.id) {
    
      userUrls[uid] = urlDatabase[uid];
    
    }

  }
  return userUrls;
};




// PSEUDO DATABASES

const urlDatabase = {};
const users = {};



//HOMEPAGE

app.get("/urls", (req, res) => {
 
  // const currentUser = users[req.cookies.user_id];
  const currentUser = users[req.session.user_id];

  const userUrls = urlsForUser(currentUser);


  const templateVars = {
    user: currentUser,
    urls: userUrls
  };
  
  res.render("urls_index", templateVars);
});


//NEW URL

app.post("/urls", (req, res) => {

  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  

  res.redirect(`/urls/${shortURL}`);
});




app.get("/urls/new", (req, res) => {

  // const currentUser = users[req.cookies.user_id];
  const currentUser = users[req.session.user_id];

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


  const ids = {
    currentUser: users[req.session.user_id],
    urlID: req.params.shortURL,
  };


  if (ids.currentUser && ids.currentUser.id === urlDatabase[ids.urlID].userID) {

    const templateVars = {
      user: ids.currentUser,
      shortURL: ids.urlID,
      longURL: urlDatabase[ids.urlID].longURL
    };
  
    res.render("urls_show", templateVars);
  
  } else {

    const templateVars = {
      user: null,
      shortURL: ids.urlID,
      longURL: urlDatabase[ids.urlID].longURL
    };
  

    res.render("urls_show", templateVars);
  }

  
});


//OPEN EXTERNAL LINK FOR LONG URL

app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});





//REGISTER USER

app.get("/register", (req, res) => {

  res.render('register');
});


app.post("/register", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  
  const validate = helpers.validateUser(email, users);

  if (!validate) {

    const id = generateRandomString();

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

        
        req.session.user_id = id;
        res.redirect('/urls');
      });
    });

   

  } else {
    res.redirect('/error404');
  }

});


//LOGIN USER

app.get("/login", (req, res) => {

  res.render('login');
});

app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
 

  const validate = helpers.validateUser(email, users);


  if (validate) {

    const hash = validate.password;
    
    bcrypt.compare(password, hash, function(err, result) {
      
      if (err) {
        return res.redirect('/error403');
      }

      if (result) {

        req.session.user_id = validate.id;
        res.redirect('/urls');
      } else {
        res.redirect('/error403');
      }
    });

    
   

  } else {

    res.redirect('/error403');
  }

 
});




//LOGOUT

app.post("/urls/logout", (req, res) => {

  req.session = null;
  res.redirect('/urls');

});


//EDIT URL

app.post("/urls/:shortURL/edit", (req, res) => {

  // const currentUser = users[req.cookies.user_id];
  const currentUser = users[req.session.user_id];

  if (!currentUser) {
    return res.redirect('/urls');
  }

 
  urlDatabase[req.params.shortURL] = {
    longURL: req.body.longURL,
    userID:  req.session.user_id,
  };
 

  res.redirect('/urls');



});



//DELETE URL

app.post("/urls/:shortURL/delete", (req, res) => {

  // const currentUser = users[req.cookies.user_id];
  const currentUser = users[req.session.user_id];

  if (!currentUser) {
    return res.redirect('/urls');
  }

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





