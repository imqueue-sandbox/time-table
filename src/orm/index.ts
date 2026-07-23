/*!
 * ISC License
 *
 * Copyright (c) 2026, Imqueue Sandbox
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
import { Sequelize } from 'sequelize-typescript';
import { DB_CONN_STR, DB_POOL } from '../../config.js';
import { Reservation } from './Reservation.js';

export * from './BaseModel.js';
export * from './Reservation.js';

/**
 * Creates a Sequelize instance bound to the service models.
 *
 * @param {boolean} [logging] - enable SQL logging
 * @return {Sequelize}
 */
export function createOrm(logging: boolean = false): Sequelize {
    return new Sequelize(DB_CONN_STR, {
        models: [Reservation],
        logging: logging ? (msg: string) => console.log(msg) : false,
        pool: DB_POOL,
    });
}

/**
 * Idempotent schema bootstrap: syncs the models, then installs the
 * range_date() helper and the double-booking unique index (which the previous
 * generation shipped as a sequelize-cli migration).
 *
 * @param {Sequelize} orm
 * @return {Promise<void>}
 */
export async function migrate(orm: Sequelize): Promise<void> {
    await orm.sync();

    await orm.query(
        `CREATE OR REPLACE FUNCTION range_date(TSTZRANGE) RETURNS DATE
            AS 'SELECT CAST(LOWER($1) AS DATE)'
        LANGUAGE SQL
        IMMUTABLE
        RETURNS NULL ON NULL INPUT`,
    );

    // prevents double-booking the same car within the same day (ignoring
    // soft-deleted rows); enforced at the database level
    await orm.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS car_duplicate_idx ON "Reservation" (
            "carId",
            range_date("duration"),
            COALESCE("deletedAt", '1970-01-01')
        )`,
    );
}
