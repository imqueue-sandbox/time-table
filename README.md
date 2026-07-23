# time-table

A PostgreSQL-backed [@imqueue](https://github.com/imqueue) RPC microservice that manages the
**washing schedule** — reservations, the working-hours configuration, and the rule that keeps a
car from being double-booked.

It stores reservations as time ranges (`tstzrange`) and exposes the station's options (opening
hours, number of boxes, washing types and their durations). It never speaks HTTP; every method
is exposed over the `@imqueue/rpc` Redis message queue and consumed by the gateways (`api`,
`api-rest`).

## About the tutorial

This repo is one piece of the **imqueue-sandbox** tutorial — a complete car-wash booking app
built from independent RPC microservices that communicate over a Redis-backed message queue.

| Repo | Role | Store |
|------|------|-------|
| [user](https://github.com/imqueue-sandbox/user) | Customer accounts & their garage | MongoDB |
| [auth](https://github.com/imqueue-sandbox/auth) | Login, JWT issuing & revocation | Redis |
| [car](https://github.com/imqueue-sandbox/car) | Car catalog (makes / models / types) | in-memory |
| **[time-table](https://github.com/imqueue-sandbox/time-table)** | Washing reservations & schedule | PostgreSQL |
| [api](https://github.com/imqueue-sandbox/api) | GraphQL gateway orchestrating the fleet | — |
| [api-rest](https://github.com/imqueue-sandbox/api-rest) | REST/OpenAPI gateway over the same fleet | — |
| [web-app](https://github.com/imqueue-sandbox/web-app) | React front-end on `api` (GraphQL/Relay) | — |
| [web-app-rest](https://github.com/imqueue-sandbox/web-app-rest) | React front-end on `api-rest` (REST) | — |

The backend services are transport-agnostic: two interchangeable gateways and two matching
front-ends prove the same fleet can be fronted by completely different API styles without
changing a single service.

## RPC methods

Exposed by the `TimeTable` service (`src/TimeTable.ts`) via `@expose()`:

| Method | Signature | Description |
|---|---|---|
| `version` | `()` | Running service name / version / repository. |
| `config` | `()` | Time-table options: working hours, box count, washing types. |
| `list` | `(date?, fields?)` | Reservations for the given day (defaults to today). |
| `fetch` | `(id, fields?)` | A single reservation by id, or `null`. |
| `reserve` | `(reservation, fields?)` | Create a reservation; returns that day's updated list. |
| `cancel` | `(id, fields?)` | Soft-delete a reservation; returns that day's updated list. |

A reservation is `{ id, carId, userId, type, duration }`, where `type` is `fast` / `std` /
`full` and `duration` is a `[start, end)` timestamp range. The default station options are
**08:00–21:00**, **4 boxes**, and washing types **fast (30 min)**, **std (45 min)**,
**full (60 min)**.

## Double-booking prevention

`reserve` is guarded at the database level by a unique index (`car_duplicate_idx`) on
`(carId, day-of-duration, coalesced deletedAt)`: a car may hold at most one active reservation
per calendar day. A PostgreSQL unique-violation (`23505`) is translated into the friendly error
*"Time for given car has been already reserved at this date!"*. Reservations are **paranoid**
(soft-deleted), so cancelling frees the slot again. The schema (including the index and a
`range_date()` helper function) is created automatically on start via `orm.sync()` + migration.

## Configuration

Environment variables (loaded from an optional `.env` via `process.loadEnvFile()`):

| Variable | Default | Purpose |
|---|---|---|
| `DB_CONN_STR` | `postgres://tutmq:tutmq@localhost:5432/tutmq` | PostgreSQL connection string. |
| `DB_POOL_MAX` | `250` | Maximum Sequelize connection-pool size. |
| `IMQ_REDIS` | `localhost:6379` | Redis endpoint(s) for the RPC message queue. |

## Running

Development mode (rebuilds and restarts on change):

~~~bash
npm run dev
~~~

Production mode:

~~~bash
npm start
~~~

Both start the service under the imqueue label `time-table`. Requires a reachable PostgreSQL at
`DB_CONN_STR` and Redis at `IMQ_REDIS`.

## License

[ISC License](LICENSE)
