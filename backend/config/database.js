import pg from 'pg'

const { Pool } = pg
let pool

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    email varchar(254) NOT NULL UNIQUE,
    password_hash text NOT NULL,
    role varchar(32) NOT NULL DEFAULT 'customer'
      CHECK (role IN ('customer', 'shipping_staff', 'administrator')),
    created_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS shipments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    sender jsonb NOT NULL,
    receiver jsonb NOT NULL,
    cargo jsonb NOT NULL,
    origin varchar(120) NOT NULL,
    destination varchar(120) NOT NULL,
    status varchar(32) NOT NULL DEFAULT 'Pending'
      CHECK (status IN ('Pending', 'Confirmed', 'Dispatched', 'In Transit', 'Arrived', 'Delivered')),
    tracking_number varchar(100) UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS shipments_user_created_at_idx
    ON shipments(user_id, created_at DESC);
`

export async function connectDatabase(uri = process.env.DATABASE_URL) {
  if (!uri) {
    throw new Error('Set DATABASE_URL to connect to PostgreSQL.')
  }

  pool = new Pool({ connectionString: uri })
  await pool.query('SELECT 1')
  await pool.query(schema)
  console.info('Connected to PostgreSQL.')
}

export function query(text, values) {
  if (!pool) {
    throw new Error('The PostgreSQL connection has not been initialized.')
  }
  return pool.query(text, values)
}

export async function closeDatabase() {
  if (!pool) return
  const currentPool = pool
  pool = undefined
  await currentPool.end()
}
