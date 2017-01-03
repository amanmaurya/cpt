var express = require('express');
var router = express.Router();
var login = require('../lib/login.js');
var auth = require('../lib/auth.js');
var util = require('../lib/util.js');
var mailer = require('../lib/mailer.js');
var auth = require('../lib/auth.js');
var mysql = require('../lib/mysql.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  var query = require('url').parse(req.url,true).query;
  // console.log(query.flag)
  // console.log( 'sessssssssss',req.session)
  var role = req.session.role;
  // console.log('user hahahah', req.session)
  if ((role == 0 || role == 1) && auth.isUserValidated(req)) {
    res.redirect('/users/upload_template');
  } else if(role == 2 && auth.isUserValidated(req)){
    res.redirect('/qc/');
  } else {
    var error = req.session.error || (req.session.error = false);
    if(query.flag==undefined)
    flag=0;
    else
    flag=query.flag;
    res.render('index', {error: error,flag:flag});
  }
});


router.post('/', function(req, res, next) {
  // console.log('Hi')
  // console.log(body)
  // console.log(session)
  // if()
  if(req.body.flag==1 &&  req.session.logintry==1){
      req.body.email=req.session.oldid;
      req.body.password= req.session.olpass;
  }
  

  login(req, res);
});

router.get('/forgot_password', function(req, res, next) {
  var query = require('url').parse(req.url,true).query;
  var msg = query.msg;
  if(msg == undefined){
    msg = '';
  }
  res.render('forget',{error:msg});
});

router.post('/forgot_password', function(req, res, next) {
  console.log(req.body);
  var query = {
    sql : 'call usp_forgetpassword_rs(?)',
    values : [req.body.email]
  }
  mysql(query,function(err,result){
    if(err){
      console.log(err);
    }
    else
    {
      var check = result[0];
      var finalresult=check[0].count;
      if( finalresult != 0){
        var password = util.generatePassword();
        var message = 'Your new password send to your emailid ';
        mailer(req, res, password, '/', 'Please try with this new password : ');
        res.redirect('/forgot_password?msg='+message)
      }
      else{
        var message = 'Please give right emailid ';
        res.redirect('/forgot_password?msg='+message)
      }
    }
  });
  
});

module.exports = router;
