const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "db_smartkampus",
  password: process.env.PASSWORDDB,
  port: process.env.PORTDB,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
