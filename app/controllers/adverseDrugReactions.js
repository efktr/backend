module.exports = (context) => {
    return {
        highConfidenceAdr(request, result, next) {
            return context.database.any('\
            SELECT dbjoin.name, json_agg(umlsdic.name) \
            FROM umls_dictionary AS umlsdic \
            JOIN ( \
                SELECT \
            db.name, \
                mapped_ards.umls_id \
            FROM drugbank AS db \
            JOIN \
            (SELECT \
            ptd.drugbank_id, \
                adr.umls_id \
            FROM pubchem_to_drugbank AS ptd \
            JOIN \
            (SELECT * \
                FROM adverse_drug_reactions \
            WHERE NUMRANGE(0.9, 1.0) @> adverse_drug_reactions.range) AS adr \
            ON adr.pubchem_id = ptd.pubchem_id) AS mapped_ards \
            ON mapped_ards.drugbank_id = db.drugbank_id \
        ) AS dbjoin \
            ON dbjoin.umls_id = umlsdic.umls_id \
            GROUP BY dbjoin.name;',
                request.query.q)
                .then(function (data) {
                    result.status(200).send(data);
                })
                .catch(function (err) {
                    return next(err);
                });
        },

        adrBasedOnDrugbankId(request, result, next) {
            return context.database.any('\
            SELECT \
            umlsdic.name, \
                adrsj.range, \
                adrsj.support \
            FROM umls_dictionary AS umlsdic \
            JOIN ( \
                SELECT DISTINCT \
            adr.umls_id, \
                adr.range, \
                adr.support \
            FROM adverse_drug_reactions AS adr \
            JOIN ( \
                SELECT ptd.pubchem_id \
            FROM pubchem_to_drugbank AS ptd \
            WHERE ptd.drugbank_id = $1) AS ptdj \
            ON ptdj.pubchem_id = adr.pubchem_id \
        ) AS adrsj \
            ON adrsj.umls_id = umlsdic.umls_id\
            ORDER BY adrsj.range DESC;',
                request.params.drugbankId)
                .then(function (data) {
                    result.status(200).send(data);
                })
                .catch(function (err) {
                    return next(err);
                });
        },

        getADRBasedOnUmlsId(request, result, next) {
            return context.database.one('\
            SELECT \
                umls_id AS umlsId,\
                name AS name \
            FROM \
                umls_dictionary \
            WHERE \
                umls_id = $1;',
                request.params.umlsId)
                .then(function (data) {
                    result.status(200).send(data);
                })
                .catch(function (err) {
                    return next(err);
                });
        }
    }
};