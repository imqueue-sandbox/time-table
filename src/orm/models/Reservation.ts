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
import {
    AllowNull,
    AutoIncrement,
    BaseModel,
    Column,
    ColumnIndex,
    CreatedAt,
    DataType,
    DeletedAt,
    IndexMethod,
    PrimaryKey,
    Table,
    UpdatedAt,
} from '@imqueue/pg-sequelize';
import { classType, property } from '@imqueue/rpc';

/**
 * Reservation model. Doubles as an @imqueue/rpc complex type (@classType) and
 * an @imqueue/pg-sequelize model, so the same declaration describes the wire
 * format and the table.
 */
@classType()
@Table({
    tableName: 'Reservation',
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
})
export class Reservation extends BaseModel<Reservation> {
    @property('number')
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.BIGINT)
    public id: number;

    /**
     * The double-booking guard is a unique index over one column and two
     * expressions; @ColumnIndex emits its `expression` as a single index key,
     * so that composite is beyond what it can declare and stays an explicit
     * statement in migrate().
     */
    @property('string')
    @AllowNull(false)
    @Column(DataType.STRING(32))
    public carId: string;

    @property('string')
    @AllowNull(false)
    @Column(DataType.STRING(32))
    public userId: string;

    @property("'fast' | 'std' | 'full'")
    @AllowNull(false)
    @Column(DataType.ENUM({ values: ['fast', 'std', 'full'] }))
    public type: 'fast' | 'std' | 'full';

    /**
     * GiST is the method that makes range containment - the one query this
     * service runs on every read - use an index instead of a scan.
     */
    @property('[string, string]')
    @ColumnIndex({
        name: 'reservation_duration',
        method: IndexMethod.GIST,
        safe: true,
    })
    @AllowNull(false)
    @Column(DataType.RANGE(DataType.DATE))
    public duration: [Date, Date];

    @CreatedAt
    public createdAt: Date;

    @UpdatedAt
    public updatedAt: Date;

    @DeletedAt
    public deletedAt: Date;
}
