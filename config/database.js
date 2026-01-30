const mysql = require('mysql');

const connection = mysql.createConnection({
  host: '127.0.0.1',   
  user: 'root',
  password: '',
  database: 'repairshop',
  port: 3306,
  charset: 'utf8mb4'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database successfully');
});

module.exports = connection;