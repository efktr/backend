module.exports = (context) => {

    let drugs = context.component('controllers').module('drugs');

    context.router
        .get('/drug/:drugbankId', drugs.getDrugByDrugbankId);
};