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

/**
 * Returns start-of-day for a given date (treated as "today").
 *
 * @param {Date} [date]
 * @return {Date}
 */
export function today(date: Date = new Date()): Date {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0,
        0,
    );
}

/**
 * Returns start-of-next-day for a given date ("tomorrow").
 *
 * @param {Date} [date]
 * @return {Date}
 */
export function tomorrow(date: Date = new Date()): Date {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1,
        0,
        0,
        0,
        0,
    );
}

/**
 * Extracts the lower-bound Date from a sequelize RANGE value, which may be a
 * plain [lower, upper] tuple or an array of { value, inclusive } bounds.
 *
 * @param {any} range
 * @return {Date}
 */
export function rangeLower(range: any): Date {
    const lower = Array.isArray(range) ? range[0] : range;
    const value =
        lower && typeof lower === 'object' && 'value' in lower
            ? lower.value
            : lower;

    return new Date(value);
}
