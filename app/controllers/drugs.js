module.exports = (context) => {
    return {
        getDrugByDrugbankId(request, result, next) {
            return context.database.one('\
            SELECT \
            db.drugbank_id AS drugbankId, \
                db.name, \
                dbp.products, \
                dbs.synonyms \
            FROM \
            drugbank AS db, \
                ( \
                    SELECT drugbank_id, json_agg(product) AS products \
            FROM drugbank_products \
            WHERE drugbank_id = $1 \
            GROUP BY drugbank_id \
        ) AS dbp, \
                ( \
                    SELECT drugbank_id, json_agg(synonym) AS synonyms \
            FROM drugbank_synonyms \
            WHERE drugbank_id = $1 \
            GROUP BY drugbank_id \
        ) AS dbs \
            WHERE \
            db.drugbank_id = $1 AND \
            db.drugbank_id = dbp.drugbank_id AND \
            dbp.drugbank_id = dbs.drugbank_id;',
                request.params.drugbankId)
                .then(function (data) {
                    result.status(200).send(data);
                })
                .catch(function (err) {
                    return next(err);
                });
        },

        getDrugsByADR(request, result, next) {
            return context.database.any('\
            SELECT \
            joint.range, \
                joint.support, \
                db.drugbank_id, \
                db.name \
            FROM \
            drugbank AS db \
            JOIN \
            ( \
                SELECT \
            pbc.range, \
                pbc.support, \
                pctd.drugbank_id \
            FROM \
            pubchem_to_drugbank AS pctd \
            JOIN \
            ( \
                SELECT \
            range, \
                support, \
                pubchem_id \
            FROM \
            adverse_drug_reactions \
            WHERE \
            umls_id = $1 \
        ) AS pbc ON pbc.pubchem_id = pctd.pubchem_id \
        ) AS joint ON joint.drugbank_id = db.drugbank_id\
        ORDER BY joint.range DESC;;',
                request.params.umlsId)
                .then(function (data) {
                    result.status(200).send(data);
                })
                .catch(function (err) {
                    return next(err);
                });
        },
    }
};