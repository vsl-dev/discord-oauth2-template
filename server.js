const express = require('express');
const app = express();
const bodyparser = require("body-parser");
const session = require("express-session");
const path = require("path");
const ejs = require("ejs");
const url = require("url"); 
const port = 8080;

// view engine & others

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.engine("html", ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use('/assets', express.static('assets'));
app.set('json spaces', 1)


// discord oauth2

const passport = require("passport");
const { Strategy } = require("passport-discord");

passport.serializeUser((user, done) => {
  done(null, user);
 });
 
 passport.deserializeUser((obj, done) => {
     done(null, obj);
 });
let strategy = new Strategy({
  clientID: "CLIENT_ID",
  clientSecret: "CLIENT_SECRET",
  callbackURL: "CALLBACK_URL (https://example.com/callback)",
  scope: ["identify"]
}, (accesToken, refreshToken, profile, done) => {
  process.nextTick( () => done(null, profile))
})
passport.use(strategy)

app.use(session({
  secret: "vsldev",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.get("/login", passport.authenticate("discord", {
  scopes: ["identify"] }))

app.get("/callback", passport.authenticate("discord", {
  failureRedirect: "/?fail=true" 
}), (req, res) => {
      res.redirect('/')
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// pages

app.get('/', (req, res) => {
	res.render('index', {
		user: req.user
	})
})

// other

app.listen(port, () => {
	console.log("Server running!");
  console.log("https://github.com/vsl-dev");
})
