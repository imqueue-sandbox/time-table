/*!
 * ISC License
 * 
 * Copyright (c) 2018, Imqueue Sandbox
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
 * 
 */
import { expect } from 'chai';
import { TimeTable } from '../../src';

describe('TimeTable', () => {
    it('should be a class of IMQService', () => {
        expect(typeof TimeTable)
            .equals('function');
        expect(typeof (TimeTable.prototype as any).describe)
            .equals('function');
    });

    // implement tests for your service methods here...
    // test below is just an example, remove it when it is not required anymore
    describe('hello()', () => {
        const service = new TimeTable();
        it('should be a function', () => {
            expect(typeof service.hello).equals('function');
        });
        it('should return "Hello!" string', () => {
            expect(service.hello()).equals('Hello!');
        });
    });
});
