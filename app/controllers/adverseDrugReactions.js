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
            return context.database.any(`
                SELECT dict.umls_id, dict.name, adrs.lower, adrs.higher
                FROM umls_dictionary as dict
                  JOIN (
                         SELECT DISTINCT
                           umls_id,
                           AVG(lower) AS lower,
                           AVG(higher) AS higher
                         FROM stitch_to_umls
                         WHERE stitch_id = (
                           SELECT stitch_id
                           FROM stitch_to_drugbank
                           WHERE drugbank_id = (
                             SELECT drugbank_id
                             FROM drugbank_id_mapping
                             WHERE mapping = $1
                             LIMIT 1
                           )
                           LIMIT 1) GROUP BY umls_id
                       ) AS adrs
                    ON adrs.umls_id = dict.umls_id;`,
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
        },

        getADRBasedOnName(request, result, next) {
            return context.database.any('\
            SELECT \
                umls_id AS umlsId,\
                name AS name \
            FROM \
                umls_dictionary \
            WHERE \
                name ~* \'\\m$1:value\'\
            LIMIT 5;',
                request.query.q)
                .then(function (data) {
                    console.log(data);
                    result.status(200).send(data);
                })
                .catch(function (err) {
                    console.error(err);
                    return next(err);
                });
        }
    }
};