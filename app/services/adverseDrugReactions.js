module.exports = (context) => {

    let adverseDrugReactions = context.component('controllers').module('adverseDrugReactions');

    context.router
        .get('/adrs/:drugbankId', adverseDrugReactions.adrBasedOnDrugbankId)
        .get('/adr/:umlsId', adverseDrugReactions.getADRBasedOnUmlsId);
};