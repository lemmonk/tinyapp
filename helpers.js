


const validateUser = (email, usersDB) => {

  
  if (!email) {
    return false;
  }


  for (const user in usersDB) {

    if (email === usersDB[user].email) {
      const userObj = usersDB[user];
      console.log('ID: ',userObj);
      return userObj;
    }

  }

  return false;

};

const generateRandomString = () => {

  return Math.random().toString(36).substring(2, 8);
};

 
const urlsForUser = (id, urlDB) => {

  const userUrls = {};

  for (const uid in urlDB) {
   
    if (id && urlDB[uid].userID === id.id) {
    
      userUrls[uid] = urlDB[uid];
    
    }

  }
  return userUrls;
};

module.exports = {
  validateUser,
  generateRandomString,
  urlsForUser,
};