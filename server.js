if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session');


const initializePassport = require('./passport-config')
initializePassport(
  passport, 
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id),
); //find email inside array of logins email

const users = [];

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false})) //middleware allowing parsing of data from client to server (req.body)
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());


app.get('/', checkAuthenticated,(req, res) => {
  res.render('index.ejs', {name: req.user.name})
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
});

//use passport authentication for login
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/', //go to home page for successful login
  failureRedirect: '/login', //go back to login for unsuccessful login
  failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    res.redirect('/login');
  } catch {
    res.redirect('/register')
  }
  console.log(users);
});


function checkAuthenticated(req, res, next){ //if user is not authenticated, need to go to login page
  if (req.isAuthenticated()) { // //part of passport API: returns true or false
    return next();
  }
  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){ //if authenticated user, don't go to login page
  if(req.isAuthenticated()) { //part of passport API
    return res.redirect('/')
  }
  next();
}

app.listen(3000, () => {
  console.log('app listening on localhost:3000')
})