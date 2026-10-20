/**
 * Local, dependency-free BroccoliDB surface.
 *
 * BroccoliDB is table-first and keeps its hot path in memory. The optional
 * JSONSQL subset runs over those same tables. WAL/CAS/checkpoint layers use
 * ordinary files and Node built-ins; no native database driver is required.
 */

// SPDX-FileCopyrightText: 2026 William Andrew Cruz
// SPDX-License-Identifier: Apache-2.0

export * from "./broccolidb.contracts"
export * from "./broccolidb-aggregation"
export * from "./broccolidb-mutex"
export * from "./broccolidb-natural-query"
export {
  JsonSqlError,
  JsonSqlStatement,
  type JsonSqlColumnType,
  type JsonSqlDatabase,
  type JsonSqlRunResult,
  type JsonSqlStatementKind,
  type JsonSqlValue,
} from "./broccolidb-jsonsql"
export * from "./broccolidb-wal"
export * from "./broccolidb-cas"
export * from "./broccolidb-table"
export * from "./broccolidb-kernel"
export * from "./TokenCompressionService"
