const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
//configure passport here

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email) //returns user by email or null
    if (user == null) {
      return done(null, false, {message: 'No user with that email'}) //error, user, message. Return done, next functino to run based on case
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user) // user found and matches password
      } else {
        return done(null, false, {message: 'Password incorrect'}) 
      }
    } catch (e) {
      return done(e);
    }
  }
  
  passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => { 
    return done(null, getUserById(id))
  });
}

module.exports = initialize;