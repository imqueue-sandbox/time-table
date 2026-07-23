import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
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
import { describe, it } from 'node:test';
import { TimeTable, today, tomorrow, rangeLower } from '../../src/index.js';

const require = createRequire(import.meta.url);

describe('TimeTable', () => {
    it('should be a class of IMQService', () => {
        assert.equal(typeof TimeTable, 'function');
        assert.equal(typeof (TimeTable.prototype as any).describe, 'function');
    });

    describe('version()', () => {
        const service = new TimeTable();
        const pkg = require('../../package.json');

        it('should return proper name string', async () => {
            assert.equal((await service.version()).name, pkg.name);
        });

        it('should return proper version string', async () => {
            assert.equal((await service.version()).version, pkg.version);
        });
    });

    describe('exposed RPC interface', () => {
        for (const method of ['list', 'fetch', 'reserve', 'cancel', 'config']) {
            it(`should expose ${method}()`, () => {
                assert.equal(
                    typeof (TimeTable.prototype as any)[method],
                    'function',
                );
            });
        }
    });

    describe('date helpers', () => {
        it('today() is midnight', () => {
            const t = today(new Date('2026-07-23T15:30:00'));

            assert.equal(t.getHours(), 0);
            assert.equal(t.getDate(), 23);
        });

        it('tomorrow() is next-day midnight', () => {
            const t = tomorrow(new Date('2026-07-23T15:30:00'));

            assert.equal(t.getDate(), 24);
            assert.equal(t.getHours(), 0);
        });

        it('rangeLower handles tuple and bound-object forms', () => {
            const d = new Date('2026-07-23T08:00:00Z');

            assert.equal(rangeLower([d, new Date()]).getTime(), d.getTime());
            assert.equal(
                rangeLower([{ value: d, inclusive: true }]).getTime(),
                d.getTime(),
            );
        });
    });
});
