module.exports = (context) => {

    let adverseDrugReactions = context.component('controllers').module('adverseDrugReactions');

    context.router
        .get('/adr/:drugbankId', adverseDrugReactions.adrBasedOnDrugbankId);
};