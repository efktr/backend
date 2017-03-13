const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

///////////////////////
// Components loader function (used to initialize all components on startup and share globals!)
///////////////////////

var context = {};

context.component = (componentName) => {
    if (!context[componentName]) {
        context[componentName] = {};
    }
    return {
        module(moduleName) {
            if (!context[componentName][moduleName]) {
                console.log('Loading ' + path.join(__dirname, "app", componentName, moduleName));
                context[componentName][moduleName] = require(path.join(__dirname, "app", componentName, moduleName))(context, componentName, moduleName);
            }
            return context[componentName][moduleName];
        }
    }
};

///////////////////////
// Useful globals
///////////////////////

context.express = express;

///////////////////////
// Server Middleware
///////////////////////

app.use(logger(app.get("env") === "production" ? "combined" : "dev"));

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// CORS
// This allows client applications from other domains use the API Server
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


//////////////////
// Load database
//////////////////

const database = context.component('.').module('database');

//////////////////
// API Queries
//////////////////

const api = context.component('.').module('router');

app.use('/', context.router);


//////////////////
// Server Setup
//////////////////

app.set("env", process.env.NODE_ENV || "development");
app.set("host", process.env.HOST || "0.0.0.0");
app.set("port", process.env.PORT || 3300);

app.listen(app.get("port"), () => {
    console.log('\n' + '**********************************');
    console.log('REST API listening on port ' + app.get("port"));
    console.log('**********************************' + '\n');
});


////////////////////
// Error Handlers
////////////////////

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status( err.code || 500 )
        .json({
            status: 'error',
            message: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    .json({
        status: 'error',
        message: err.message
    });
});

module.exports = app;