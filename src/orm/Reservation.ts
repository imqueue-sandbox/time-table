import { classType, property } from '@imqueue/rpc';
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
    Table,
    Column,
    DataType,
    AutoIncrement,
    PrimaryKey,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    AllowNull,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel.js';

/**
 * Reservation model. Doubles as an @imqueue/rpc complex type (@classType) and
 * a sequelize-typescript model.
 */
@classType()
@Table({
    tableName: 'Reservation',
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    indexes: [{ fields: ['duration'], using: 'gist' }],
})
export class Reservation extends BaseModel {
    @property('number')
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.BIGINT)
    public id: number;

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

    @property('[string, string]')
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
