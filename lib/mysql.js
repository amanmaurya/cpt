var mysql = require('mysql');

var connection = mysql.createPool({
  connectionLimit: 10,
  host: '192.168.1.56',
  user: 'sa',
  password: 'root',
  database: 'cptdev'
//   host: '139.162.60.221',
// user: 'root',
// password : 'node@1234',
// port : 3306,
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
