module.exports = {
  generateRandomString: function(num) {
    var randomText = "";
    
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < num; i++ )
    randomText += possible.charAt(Math.floor(Math.random() * possible.length));

    return randomText;
  },
  generatePassword: function() {
    return this.generateRandomString(5);
  },
  swapKeyValueInObject: function(o) {
    var newObj = {};
    for (key in o) {
      var value = key;
      var newKey = o[key];
      newObj[newKey] = value;
    }
    return newObj;
  },
  getObjectKeys: function(o) {
    return Object.keys(o);
  },
  removeKeysFromObjectWhereValueIs: function(o, v) {
    var newObj = {};
    for (key in o) {
      if (o[key] !== v) {
        newObj[key] = o[key];
      }
    }
    return newObj;
  }
}
