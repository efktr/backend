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
    }
};