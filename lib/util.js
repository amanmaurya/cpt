  Array.prototype.contains =function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};
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
  },
   removeKeysFromObjectWhereValueIs_custome: function(o) {
    var newObj = {};
    var newObj1 = {};
    newObjk=[]
    for (key in o) {
      if (key.split('_').length>1) {
        newObj[key.split('_')[0]] = o[key];
      }else{
        newObj1[key] = o[key];
      }
    }
    console.log(newObj,newObj1)
    newObjk.push(newObj)
    newObjk.push(newObj1)
    return newObjk;
  },



unique :function(arra1) {
    var arr = [];
    for(var i = 0; i < arra1.length; i++) {
        if(!arr.contains(arra1[i])) {
            arr.push(arra1[i]);
        }
    }
    return arr; 
},
  getCol: function(matrix, col) {
        //    console.log('matrix','col',col)
        var column = [];
        for (var i = 0; i < matrix.length; i++) {
            column.push(matrix[i][col]);
        }
        // console.log('column',column)
        return column;
    },
}
