var mysql = require('mysql');

var connection = mysql.createPool({
  connectionLimit: 10,
  host: '192.168.1.56',
  user: 'sa',
  password: 'root',
  database: 'cptdev'
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
