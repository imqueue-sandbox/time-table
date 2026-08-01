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
import type { FindOptions, Sequelize } from '@imqueue/pg-sequelize';
import type { IMessageQueue } from '@imqueue/rpc';
import { query } from '@imqueue/pg-sequelize';
import { expose, IMQService, lock, logged, profile } from '@imqueue/rpc';
import dayjs from 'dayjs';
import { createRequire } from 'node:module';
// @imqueue/pg-sequelize re-exports the sequelize-typescript surface, but the
// operator symbols come from sequelize itself
import { Op } from 'sequelize';
import { today, tomorrow, rangeLower } from './lib/index.js';
import { Reservation, connect, migrate } from './orm/index.js';
import { TimeTableOptions } from './types/index.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

export class TimeTable extends IMQService {
    private orm: Sequelize;

    /**
     * Returns current version of running service
     *
     * @return {{ name: string, version: string, repository?: string }}
     */
    @logged()
    @lock()
    @profile()
    @expose()
    public version(): { name: string; version: string; repository?: string } {
        const { name, version, repository } = pkg;

        return { name, version, repository: repository?.url };
    }

    /**
     * Overrides start to establish the database connection and bootstrap schema
     */
    @profile()
    public async start(): Promise<IMessageQueue | undefined> {
        this.logger.log('Initializing PostgreSQL connection...');
        this.orm = connect();
        await this.orm.authenticate();
        await migrate(this.orm);

        return super.start();
    }

    /**
     * Returns a list of reservations for a given date (or the current date if
     * omitted)
     *
     * @param {string} [date] - date to select reservations for
     * @param {string[]} [fields] - fields to select for each reservation
     * @return {Promise<Reservation[]>} - list of found reservations
     */
    @profile()
    @expose()
    public async list(
        date?: string,
        fields?: string[],
    ): Promise<Reservation[]> {
        const dateObj = date ? new Date(date) : new Date();

        // autoQuery() narrows the caller's field list to real columns (falling
        // back to the primary key when none of them are), so an unknown name
        // cannot reach the SQL; the range containment it cannot express is
        // merged in as a where fragment
        return await Reservation.findAll(
            query.autoQuery<FindOptions>(Reservation, fields, {
                where: {
                    duration: {
                        [Op.contained]: [today(dateObj), tomorrow(dateObj)],
                    },
                },
            }),
        );
    }

    /**
     * Fetches and returns a single reservation record by its identifier
     *
     * @param {string} id - reservation identifier to fetch
     * @param {string[]} [fields] - fields to select for the reservation
     * @return {Promise<Partial<Reservation> | null>} - reservation or null if not found
     */
    @profile()
    @expose()
    public async fetch(
        id: string,
        fields?: string[],
    ): Promise<Partial<Reservation> | null> {
        return await Reservation.findByPk(
            id,
            query.autoQuery<FindOptions>(Reservation, fields),
        );
    }

    /**
     * Makes a given reservation or throws a proper error if it is not possible
     *
     * @param {Reservation} reservation - reservation data structure
     * @param {string[]} [fields] - fields to select for the updated reservations list
     * @return {Promise<Reservation[]>} - updated reservations list
     */
    @profile()
    @expose()
    public async reserve(
        reservation: Reservation,
        fields?: string[],
    ): Promise<Reservation[]> {
        const { carId, userId, type } = reservation;
        const duration: [Date, Date] = [
            dayjs(reservation.duration[0]).toDate(),
            dayjs(reservation.duration[1]).toDate(),
        ];

        try {
            await Reservation.create({ carId, userId, type, duration } as any);

            return await this.list(duration[0].toISOString(), fields);
        } catch (err: any) {
            if (
                err?.original?.code === '23505' ||
                err?.parent?.code === '23505'
            ) {
                throw new Error(
                    'Time for given car has been already reserved at this' +
                        ' date!',
                );
            }

            throw err;
        }
    }

    /**
     * Cancels a reservation at a given time
     *
     * @param {string} id - reservation identifier
     * @param {string[]} [fields] - fields to select for the updated reservations list
     * @return {Promise<Reservation[]>} - updated reservations list
     */
    @profile()
    @expose()
    public async cancel(id: string, fields?: string[]): Promise<Reservation[]> {
        const reservation = await this.fetch(id);

        if (!reservation) {
            throw new Error('No such reservation found!');
        }

        await Reservation.destroy({ where: { id } });

        return this.list(
            rangeLower((reservation as Reservation).duration).toISOString(),
            fields,
        );
    }

    /**
     * Returns reservation time-table configuration settings
     *
     * @return {Promise<TimeTableOptions>} - reservations time-table options
     */
    @profile()
    @expose()
    public async config(): Promise<TimeTableOptions> {
        const options = new TimeTableOptions();

        delete (options as any).baseTimeHash;

        return options;
    }
}
