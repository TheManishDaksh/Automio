#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/44f250afd2253c39c9fdb997276b8ee06bd7f51d6ad9464729c5073c28f99a71/contract';
import endContract from '../../snapshots/44f250afd2253c39c9fdb997276b8ee06bd7f51d6ad9464729c5073c28f99a71/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/91e7f9f035806fa2789a4d726ef7724cad434fd6b00014d47ebf12d6e6bb784e/contract';
import startContract from '../../snapshots/91e7f9f035806fa2789a4d726ef7724cad434fd6b00014d47ebf12d6e6bb784e/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  placeholder,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropTable({ schema: 'public', table: 'Post' }),
      this.dropColumn({ schema: 'public', table: 'User', column: 'name' }),
      this.dropColumn({ schema: 'public', table: 'User', column: 'updatedAt' }),
      this.createTable({
        schema: 'public',
        table: 'Action',
        columns: [
          col('actionId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('zapId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'AvailableAction',
        columns: [
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'AvailableTriggers',
        columns: [
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Trigger',
        columns: [
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('triggerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('zapId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Zap',
        columns: [
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('triggerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('password', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-User-password', {
        check: () => placeholder('backfill-User-password:check'),
        run: () => placeholder('backfill-User-password:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'User', column: 'password' }),
      this.createIndex({
        schema: 'public',
        table: 'Action',
        index: 'Action_actionId_idx_903e2c58',
        columns: ['actionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Action',
        index: 'Action_zapId_idx_9709165b',
        columns: ['zapId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Trigger',
        index: 'Trigger_triggerId_idx_9ea1a7b7',
        columns: ['triggerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Trigger',
        index: 'Trigger_zapId_idx_9709165b',
        columns: ['zapId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Zap',
        index: 'Zap_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Action',
        foreignKey: {
          name: 'Action_zapId_fkey',
          columns: ['zapId'],
          references: { schema: 'public', table: 'Zap', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Action',
        foreignKey: {
          name: 'Action_actionId_fkey',
          columns: ['actionId'],
          references: { schema: 'public', table: 'AvailableAction', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Trigger',
        foreignKey: {
          name: 'Trigger_zapId_fkey',
          columns: ['zapId'],
          references: { schema: 'public', table: 'Zap', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Trigger',
        foreignKey: {
          name: 'Trigger_triggerId_fkey',
          columns: ['triggerId'],
          references: { schema: 'public', table: 'AvailableTriggers', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Zap',
        foreignKey: {
          name: 'Zap_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
