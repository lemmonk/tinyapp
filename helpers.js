


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

module.exports = {validateUser};