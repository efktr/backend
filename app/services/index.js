/**
 * Created by chdallago on 11/03/2017.
 */

module.exports = (context) => {
    context.router.get('/', (req, res, next) => {
        res.status(200)
            .json({
                status: 'success',
                message: 'Live long and prosper!'
            });
    });

    return;
};