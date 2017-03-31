module.exports = (context) => {
    context.router
        .get('/', (request, result) => {
            result.status(200)
                .json({
                    status: 'success',
                    message: 'Live long and prosper!'
                });
        });
};