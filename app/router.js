let fs = require('fs');
let path = require('path');

module.exports = (context) => {
    let router = new context.express.Router();
    context.router = router;

    fs.readdir(path.join(__dirname, "services"), (err, files) => {
        files.forEach(file => {
            context.component('services').module(file.replace('.js',''));
        });
    });

    return context.router;
};