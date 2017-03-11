module.exports = (context) => {
    let router = new context.express.Router();
    context.router = router;

    [
        "index"
    ].forEach((service) => {
        context.component('services').module(service);
    });

    return router;
};