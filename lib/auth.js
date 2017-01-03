Array.prototype.findByValueOfObject = function(key, value) {
  return this.filter(function(item) {
    return (item[key] === value);
  });
}
module.exports = {
  isUserValidated: function(req) {
    // console.log(req.session.role ,req.app.locals.emails.findByValueOfObject('sid', req.sessionID))
    return ((req.session.role  == 1 || req.session.role  == 0 || req.session.role  == 2)&&(req.app.locals.emails.findByValueOfObject('sid', req.sessionID).length>0)) ? true : false;
  },

  checkRole: function(req) {
    return req.session.role 
  },
  isAdmin: function(req){
  	  		return this.isRole(req,1);
  	return false;
  },
  isQCUser: function(req){
    return this.isRole(req,2);
    return false;
  },
  isRole: function(req, role) {
    return req.session.role == role;
  },

}
