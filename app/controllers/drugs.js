module.exports = (context) => {
    return {
        getDrugByDrugbankId(request, result, next) {
            return context.database.one(`
            SELECT
              db.drugbank_id AS drugbankId,
              db.name,
              dbp.products,
              dbs.synonyms
            FROM
              drugbank AS db,
              (
                SELECT drugbank_id, json_agg(product) AS products
                FROM drugbank_products
                WHERE drugbank_id = (
                  SELECT drugbank_id
                  FROM drugbank_id_mapping
                  WHERE mapping = $1
                  LIMIT 1
                )
                GROUP BY drugbank_id
              ) AS dbp,
              (
                SELECT drugbank_id, json_agg(synonym) AS synonyms
                FROM drugbank_synonyms
                WHERE drugbank_id = (
                  SELECT drugbank_id
                  FROM drugbank_id_mapping
                  WHERE mapping = $1
                  LIMIT 1
                )
                GROUP BY drugbank_id
              ) AS dbs
            WHERE
              db.drugbank_id = (
                  SELECT drugbank_id
                  FROM drugbank_id_mapping
                  WHERE mapping = $1
                  LIMIT 1
                ) AND
              db.drugbank_id = dbp.drugbank_id AND
              dbp.drugbank_id = dbs.drugbank_id;
            `,
                request.params.drugbankId)
                .then(function (data) {
                    result.status(200).send(data);
                })
                .catch(function (err) {
                    return next(err);
                });
        },

        getDrugsByADR(request, result, next) {
            return context.database.any(`
            SELECT db.drugbank_id, db.name
                FROM drugbank AS db
                JOIN (
                    SELECT drugbank_id
                FROM stitch_to_drugbank AS std
                JOIN (
                    SELECT DISTINCT stitch_id
                FROM stitch_to_umls
                WHERE umls_id = $1
            ) AS stitch_mapping
                ON stitch_mapping.stitch_id = std.stitch_id
            ) AS drugbank_mapping
            ON drugbank_mapping.drugbank_id = db.drugbank_id;`,
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