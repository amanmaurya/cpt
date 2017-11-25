var mysql = require('mysql');

var connection = mysql.createPool({
  connectionLimit: 10,
  // host: '192.168.1.54',
  user: 'fusiontest',
  password: 'test@123',
  database: 'cptdev'
  host:'180.151.101.114'
//   host: '139.162.60.221',
// user: 'root',
// password : 'node@1234',
  port : 9656,
// database: 'cptdev'
});

connection.on('error', function(err) {
  console.log(err);
  //console.log(connection);
  connection.destroy();
  //console.log(connection);
});

module.exports = function(query, fn) {
  connection.query(query, fn);
}
