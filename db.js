import * as pg from 'pg'
const { Pool } = pg.default

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
})

export async function dbQuery(query, params) {
    const results = await pool.query(query, params)
    return results.rows
}
