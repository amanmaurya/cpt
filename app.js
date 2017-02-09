var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var multer = require('multer');
var auth=require('./lib/auth.js');

var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var qc = require('./routes/qc');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({}));
app.use(session({secret: 'alskdjf2452klj42lkh24lk4j2l'}));

app.locals.stringMatcher = function(list, value) {
  var len = list.length;
  var found = false
  var match;
  list.forEach(function(item, index) {
    if (item === value) return item;
    if (len === index+1 && found)
      return item;
    if (item.indexOf(value) > -1) {
      match = item; 
      found = true;
    }
  });
  return null;
}
var emails=['dummy'];
app.locals.emails=emails;
app.use('/', routes);
app.use('/users', users);
app.use('/admin', admin);
app.use('/qc', qc);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.message);
    if (err.code == 'ETIMEDOUT') {
      res.render('something_went_wrong', {
        message: 'Your database connection has timedout. Make sure your have working internet connection or ask db-admin to resolve the issue.',
        error: err,adminUser: auth.isAdmin(req),name:req.session.email
      });
    } else {
      res.render('something_went_wrong', {
        message: 'An error occured! Make sure the entries entered/mapped are correct. Also make sure while *counting sheet number* you had all the sheets unhidden in excel and you counted it correctly.',
        error: err,adminUser: auth.isAdmin(req),name:req.session.email
      });
    }
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err.message);
  if (err.code == 'ETIMEDOUT') {
    res.render('something_went_wrong', {
      message: 'Your database connection has timedout. Make sure your have working internet connection or ask db-admin to resolve the issue.',
      error: err,adminUser: auth.isAdmin(req),name:req.session.email
    });
  } else {
    res.render('something_went_wrong', {
      message: 'An error occured! Make sure the entries entered/mapped are correct. Also make sure while *counting sheet number* you had all the sheets unhidden in excel and you counted it correctly.',
      error: err,adminUser: auth.isAdmin(req),name:req.session.email
    });
  }
});

app.listen(8080);


module.exports = app;
