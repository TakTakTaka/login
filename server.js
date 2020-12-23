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


app.get('/', (req, res) => {
  res.render('index.ejs', {name: req.user.name})
});

app.get('/login', (req, res) => {
  res.render('login.ejs')
});

//use passport authentication for login
app.post('/login', passport.authenticate('local', {
  successRedirect: '/', //go to home page for successful login
  failureRedirect: '/login', //go back to login for unsuccessful login
  failureFlash: true
}));

app.get('/register', (req, res) => {
  res.render('register.ejs')
});

app.post('/register', async (req, res) => {
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

app.listen(3000, () => {
  console.log('app listening on localhost:3000')
})