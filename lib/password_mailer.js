var nodemailer = require('nodemailer');
var mysql = require('./mysql.js');

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'support@polestarllp.com',
    pass: 'Polestar@123'
  }
});

module.exports = function(req, res, password) {
  //console.log("I am here");

  var mailOptions = {
    from: 'Support Team Polestar',
    to: req.body.email, // list of receivers
    subject: 'Password for Catalog Automation',
    text: 'Use this password to log into app: ' + password,
  }

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      mysql('select role from users where email_id = \"' + req.session.email + "\";", function(err, results) {
        if (err) console.log(err);
        if (results.length > 0) {
          if (results[0].role == 0) res.redirect('/admin/User?msg=1');
          else res.redirect('/admin/User?msg=1');
        }
      });
    }else{
      if (req.session.email != null || req.session.email != undefined) {
        //res.redirect('/admin/create_users');
        console.log('Message sent: ' + info.response);
      }
    }
  });
}
