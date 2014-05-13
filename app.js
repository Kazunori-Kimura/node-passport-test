var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy;

// Twitter Key
// TODO: process.envに変更する
var TwitterAuth = require('./twitter_key.json');

// passport configuration

// 認証後、アカウント情報を処理する
passport.serializeUser(function serialize(user, done){
    done(null, user);
});
passport.deserializeUser(function deserialize(obj, done){
    done(null, obj);
});
console.log(TwitterAuth);
passport.use(new TwitterStrategy(
    {
        consumerKey: TwitterAuth.key,
        consumerSecret: TwitterAuth.secret,
        callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
    },
    function verify(token, tokenSecret, profile, done){
        profile.twitter_token = token;
        profile.twitter_token_secret = tokenSecret;

        process.nextTick(function(){
            return done(null, profile);
        });
    }
));

// routes
var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.use(session({secret: 'express_session_var'}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/users', users);

// twiter認証
app.get("/auth/twitter", passport.authenticate("twitter"));

// 認証後のcallback
app.get("/auth/twitter/callback", passport.authenticate("twitter",
    {
        successRedirect: "/success",
        failureRedirect: "/failure"
    }
));

// 認証後に遷移するページ
app.get("/success", auth.success);
app.get("/failure", auth.failure);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
