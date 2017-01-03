var isValidEmail = require('./email_validation.js');
var passwordMailer = require('./password_mailer.js');
var mysql = require('./mysql.js');
var generatePassword = require('./generate_password');

var createUser = function(req, res) {
  if (isValidEmail(req.body.email)) {

//console.log('validate emails')
    mysql("Select * from users where email_id='"+req.body.email+"'", function(errs,row,fild){
if(row.length>0)
{
  res.redirect('/admin/User?msg=2');
return;
}

else
{

     var password = generatePassword();
    var query = 'INSERT INTO users (email_id, password,name,role) values (' + "\""
      + req.body.email.toLowerCase() + "\"" + ',' + "\"" 
      + password + "\"" + ','+ "\""
      + req.body.name + "\"" + ','
      + req.body.role +');';
      console.log(query);
    mysql(query, function(err, rows, fields) {
      if (err) console.log("Error occured in creating user " + err);
      else passwordMailer(req, res, password);
    });
    //req.flash('info', 'User successfully created!');
      res.redirect('/admin/User?msg=1'); 
}
    });

  } else {
    //req.flash('info', 'Email address is not correct');
    res.redirect('/admin/User?msg=3');
  }
}

module.exports = createUser;
