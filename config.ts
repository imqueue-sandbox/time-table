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
import type { IMQORMOptions } from '@imqueue/pg-sequelize';
import type { IMQServiceOptions } from '@imqueue/rpc';
import { DEFAULT_IMQ_SERVICE_OPTIONS as opts } from '@imqueue/rpc';
import { fileURLToPath } from 'node:url';

try {
    // native .env files support; throws when no .env file exists
    process.loadEnvFile();
} catch {
    /* no .env file - rely on the process environment */
}

export const serviceOptions: Partial<IMQServiceOptions> = {
    cluster: (process.env['IMQ_REDIS'] || `${opts.host}:${opts.port}`)
        .split(',')
        .map((instance: string) => {
            const [host, port] = instance.split(':');

            return { host, port: Number(port) };
        }),
    logger: console,
};

export const DEFAULT_DB_USER = 'tutmq';
export const DEFAULT_DB_PASS = 'tutmq';
export const DEFAULT_DB_NAME = 'tutmq';
export const DEFAULT_DB_PORT = 5432;
export const DEFAULT_DB_HOST = 'localhost';
export const DEFAULT_DB_DIALECT = 'postgres';

export const DB_CONN_STR: string =
    process.env['DB_CONN_STR'] ||
    `${DEFAULT_DB_DIALECT}://${DEFAULT_DB_USER}:${DEFAULT_DB_PASS}` +
        `@${DEFAULT_DB_HOST}:${DEFAULT_DB_PORT}/${DEFAULT_DB_NAME}`;

export const DB_POOL = {
    max: Number(process.env['DB_POOL_MAX']) || 250,
    min: 2,
    idle: 30000,
    acquire: 30000,
};

/**
 * Start-up options for the @imqueue/pg-sequelize connection. Only the first
 * `database()` call reads them, so this is start-up config, not something to
 * vary per call.
 */
export const dbConfig: IMQORMOptions = {
    logger: console,
    connectionString: DB_CONN_STR,
    sequelize: {
        dialect: DEFAULT_DB_DIALECT,
        pool: DB_POOL,
        // falsy leaves logging off; truthy hands SQL to the package formatter,
        // which honours SQL_PRETTIFY / SQL_COLORIZE
        logging: !!Number(process.env['SQL_LOG'] || 0),
    },
    // database() walks this for COMPILED models, taking from each file the
    // export named after it - so it must point at the build output, and is
    // resolved off this module rather than off cwd
    modelsPath: fileURLToPath(new URL('./src/orm/models/', import.meta.url)),
};
