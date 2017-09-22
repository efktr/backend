module.exports = (context) => {
    return {
        search(request, result, next) {
            return context.database.any('\
            SELECT \
                reference,\
                sum(case when "type" = \'adr\' then 1 else 0 end) as adr, \
                name,\
                json_agg("text") AS synonyms,\
                count("text") AS support \
            FROM search \
            WHERE text ~* \'\\m$1:value\' \
            GROUP BY reference, name \
            ORDER BY support DESC;',
                request.query.q)
                .then(function (data) {
                    result.status(200).send(data);
                })
                .catch(function (err) {
                    return next(err);
                });
        },

        autocomplete(request, result, next){
            return context.database.any(' SELECT text  \
                                          FROM search         \
                                          WHERE text ~* \'\^$1:value\'    \
                                          ORDER BY text\
                                          LIMIT 4;',
                request.query.q)
                .then(function (data) {
                    result.status(200).send(data);
                })
                .catch(function (err) {
                    return next(err);
                });
        }
    }
};