var mysql = require('../lib/mysql.js');

Array.prototype.findByValueOfObject = function(key, value) {
  return this.filter(function(item) {
    return (item[key] === value);
  });
}
module.exports = function(req, res) {
  var query = {
    sql: 'call usp_validateuser_rs(?, ?);',
    values: [req.body.email, req.body.password]
  }
  mysql(query, login);

  function login(err, result) {
    if (err) {
      console.log(err);
    } else {
      //console.log(result[0]);
      if (result[0] && result[0][0] && result[0][0].isvalid) {
        //console.log('hello');
        // console.log('hello');
        var uid =result[0][0].email_id;
        // console.log('uid',uid)
        // console.log('app.locals.emaill',req.app.locals.emails);
         var a =req.app.locals.emails.findByValueOfObject('uid', uid);
         // console.log('aaaaaaaaaaaaa',a)
        if(a.length>0){
           console.log(req.body.email,req.session.oldid , req.body.flag)
            if( req.body.email==req.session.oldid && req.body.flag==1){
                req.app.locals.emails = req.app.locals.emails.filter(function (el) {
                        if (el.uid == uid) {
                            return false
                        } else {
                            return true
                        };
                    });
                req.app.locals.emails.push({'uid':uid,'sid':req.sessionID}) 
            assignRole(req, res);
             logedin=1
            }else{
                 logedin=0
            } 

        }else{
          logedin=1;
          req.app.locals.emails.push({'uid':uid,'sid':req.sessionID})
          assignRole(req, res);
        }
        if(logedin==0){
        req.session.error = false;
         req.session.logintry = 1;
           req.session.oldid=req.body.email;
        req.session.olpass= req.body.password;
        // req.session.errormsg=
        console.log('asdfasd',req.session.oldid,req.body.email)
        res.redirect('/?flag=1');
      }
      } else {
        req.session.error = true;
        res.redirect('/');
      }
    }
  }

  function assignRole(req, res) {
    req.session.email = req.body.email;
    mysql({
      sql: 'call usp_getuserrole_rs(?)',
      values: [req.body.email]
    }, getRole);

    function getRole(err, result) {
      if (err) {
        console.log(err);
      } else {
        //console.log(result[0]);
        var role = result[0][0].Role;
        var uid =result[0][0].ID;
        req.session.uid=uid; 
        req.session.role = role;
        req.session.name = result[0][0].name;
        
        //console.log(role);
        if (role == 0 ) {
          //show log page TODO
          res.redirect('/users/upload_template');
        } else if(role == 1 ){
          res.redirect('/admin/');
        }else {
          res.redirect('/qc/');

        }
      }
    }
  }
}
  //console.log('hello');
        


