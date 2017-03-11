module.exports = (context) => {

    let search = context.component('controllers').module('search');

    context.router
        .get('/search', search.search)
        .get('/autocomplete', search.autocomplete);
};