const knex = require("knex")({
    client: "mysql2",
    connection: {
        host: "remotemysql.com",
        user: "BNVeeycnGG",
        password: "0SC5zMXRNh",
        database: "BNVeeycnGG",
        port: 3306,
    },
    pool: {
        min: 0,
        max: 50,
    },
});

module.exports = knex;