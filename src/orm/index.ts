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
import type { Sequelize } from '@imqueue/pg-sequelize';
import { database } from '@imqueue/pg-sequelize';
import { dbConfig } from '../../config.js';

export * from './models/Reservation.js';

/**
 * Connects to the database and registers the models found under
 * `dbConfig.modelsPath`.
 *
 * The connection is a process-wide singleton owned by @imqueue/pg-sequelize:
 * the first call builds it, every later one hands back the same instance and
 * ignores its argument.
 *
 * @return {Sequelize}
 */
export function connect(): Sequelize {
    return database(dbConfig);
}

/**
 * Idempotent schema bootstrap: syncs the models - which also creates the
 * indices they declare with @ColumnIndex - then installs what the model
 * declarations cannot express.
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

    // Prevents double-booking the same car within the same day, ignoring
    // soft-deleted rows. A key of one column plus two expressions is more than
    // @ColumnIndex can declare - it emits its `expression` as a single index
    // key - so this one is written out.
    await orm.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS car_duplicate_idx ON "Reservation" (
            "carId",
            range_date("duration"),
            COALESCE("deletedAt", '1970-01-01')
        )`,
    );
}
