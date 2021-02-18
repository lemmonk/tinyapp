const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const bcrypt = require('bcryptjs');


//HELPER FUNCTIONS

const generateRandomString = () => {

  return Math.random().toString(36).substring(2, 8);
};

 



const validateUser = (email, password) => {

  
  if (!email || !password) {
    return false;
  }


  for (const user in users) {

    if (email === users[user].email) {
      const id = users[user].id;
      return id;
    }

  }

  return false;

};


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
    userID: req.cookies.user_id
  };
  

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


const checkIds = ids => {

  if (!ids.currentUser) {
    return false;
  }

  if (ids.currentUser.id === urlDatabase[ids.urlID].userID) {
    return true;
  }

  return false;
};



app.get("/urls/:shortURL", (req, res) => {

  
  const ids = {
    currentUser: users[req.cookies.user_id],
    urlID: req.params.shortURL,
  };

  const idChx = checkIds(ids);



  if (idChx) {

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
  
  const validate = validateUser(email, password);

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

        res.cookie('user_id', id);
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
 

  const validate = validateUser(email, password);


  if (validate) {

    const hash = users[validate].password;

    bcrypt.compare(password, hash, function(err, result) {
      
      if (err) {
        return res.redirect('/error403');
      }

      if (result) {
        res.cookie('user_id', users[validate].id);
        // users[validate].id = validate;
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

  res.clearCookie('user_id');
  res.redirect('/urls');

});


//EDIT URL

app.post("/urls/:shortURL/edit", (req, res) => {

  const currentUser = users[req.cookies.user_id];

  if (!currentUser) {
    return res.redirect('/urls');
  }

 
  urlDatabase[req.params.shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };
 

  res.redirect('/urls');



});



//DELETE URL

app.post("/urls/:shortURL/delete", (req, res) => {

  const currentUser = users[req.cookies.user_id];

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





