//Inicializar la db
 require('dotenv').config()




const mysql = require('mysql');

//modulo para poder usar promesas(packete de mysql en node no las soporta)
const {promisify} = require('util');



const pool = mysql.createPool({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB
})


pool.getConnection((err, connection) => {
    if(err){
        if(err.code === "PROTOCOL_CONNECTION_LOST"){
            console.error('DATABASE CONNECTION WAS CLOSED')
        }
        if(err.code === "ER_CON_COUNT_ERROR"){
            console.error('DATABASE HAS TO MANY CONNECTIONS')
        }
        if(err.code === "ECONNREFUSED"){
            console.error('DATABASE CONNECTION WAS REFUSED')
        }
    }
    if(connection) connection.release();
    console.log('DB is Connected');
    return;
})

// Promisify pool querys, convirtiendo a promesas
pool.query = promisify(pool.query);
module.exports = pool;


// const mysql = require('mysql')
// const mysqlConnection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Salmo.83',
//     database: 'kiosco'
// })


// mysqlConnection.connect((err) =>{
//     if(err){
//         console.log(err);
//         return
//     }else{
//         console.log('db connection established')
//     }
// })

// module.exports = mysqlConnection
/*

CREATE DATABASE company;

USE company;

CREATE TABLE employes (employes

	id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(45) DEFAULT NULL,
    salary INT(11) DEFAULT NULL,
    PRIMARY KEY(id)
);

DESCRIBE employes

INSERT INTO employees values
(4, 'Juan Gabriel', 75000)

*/