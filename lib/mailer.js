var nodemailer = require('nodemailer');
var mysql = require('./mysql.js');

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'support@polestarllp.com',
    pass: 'Polestar@123'
  }
});

module.exports = function(req, res, password, redirectionPath, message) {
  var mailOptions = {
    from: 'Support Team Polestar',
    to: req.body.email, // list of receivers
    subject: 'Password for paytm catalog',
    text: message + password,
  }

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log(err);
      res.redirect('/');
    }else{
      var query = {
        sql: 'call usp_setpassword_nr(?, ?)',
        values: [req.body.email, password]
      }
      mysql(query, function(err, r) {
        
      });
    }
  });
}
