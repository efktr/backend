const promise = require('bluebird');
const pgp = require('pg-promise')({
    // Initialization Options
    promiseLib: promise
});

var connectionString = "";

if(process.env.PGURI){
    connectionString = process.env.PGURI
} else {
    connectionString += "postgres://";

    const databaseConfiguration = {
        database: process.env.PGDATABASE || "efktr_db",
        host: process.env.PGHOST || "127.0.0.1",
        port: process.env.PGPORT,
        username: process.env.PGUSER || "efktr_user",
        password: process.env.PGPASSWORD
    };

    if(databaseConfiguration.username && databaseConfiguration.username.length > 0){
        connectionString += databaseConfiguration.username;
    }

    if (databaseConfiguration.username  && databaseConfiguration.username.length > 0 && databaseConfiguration.password && databaseConfiguration.password.length > 0) {
        connectionString += ":" + databaseConfiguration.password;
    }

    if (databaseConfiguration.username  && databaseConfiguration.username.length > 0) {
        connectionString += "@";
    }

    connectionString += databaseConfiguration.host;

    if(databaseConfiguration.port !== undefined && databaseConfiguration.port !== ""){
        connectionString += ":" + databaseConfiguration.port;
    }

    if(databaseConfiguration.database !== undefined && databaseConfiguration.database !== ""){
        connectionString += "/" + databaseConfiguration.database;
    }
}

let database = pgp(connectionString);

// Test database connection, else exit
database
    .one('SELECT 1 = 1')
    .then(() => {
        // success; Do nothing
    })
    .catch(error => {
        // error;
        console.error(error);
        process.exit(1);
    });

module.exports = (context) => {
    return context.database = database;
};