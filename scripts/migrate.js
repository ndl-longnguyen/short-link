const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const projectRef = 'jgtesumifnovjxckbgge'
const dbPass = process.env.DB_PASS || 'kfmcd0vrKW3MX6Vd'

// Pooler regions
const regions = [
  'ap-southeast-1', // Singapore (most common for VN)
  'ap-northeast-1', // Tokyo
  'ap-northeast-2', // Seoul
  'us-east-1',      // N. Virginia
  'us-west-1',      // N. California
  'eu-central-1',   // Frankfurt
  'ap-south-1',     // Mumbai
  'ap-southeast-2', // Sydney
  'us-east-2',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'ca-central-1',
  'sa-east-1',
]

async function runMigration() {
  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  console.log('🚀 Attempting automated database migration...')
  console.log(`📁 Read schema file: ${sqlPath} (${sql.length} bytes)`)

  let connectedClient = null
  let matchedRegion = null

  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`
    // Pooler session mode runs on port 5432 or 6543
    for (const port of [5432, 6543]) {
      const client = new Client({
        host,
        port,
        user: `postgres.${projectRef}`,
        password: dbPass,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      })

      try {
        process.stdout.write(`Connecting to ${host}:${port}... `)
        await client.connect()
        console.log('✅ Connected!')
        connectedClient = client
        matchedRegion = `${region}:${port}`
        break
      } catch (err) {
        console.log(`❌ (${err.message})`)
        await client.end().catch(() => {})
      }
    }
    if (connectedClient) break
  }

  if (!connectedClient) {
    console.error('❌ Could not establish database connection to any Supabase region.')
    process.exit(1)
  }

  try {
    console.log(`\n⚡ Executing 001_initial_schema.sql on ${matchedRegion}...`)
    await connectedClient.query(sql)
    console.log('🎉 Migration executed successfully! All tables, RPCs, and RLS policies created.\n')

    // Verify public.links exists
    const res = await connectedClient.query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'links';")
    console.log(`✅ Table 'public.links' verified: ${res.rows[0].count === '1' ? 'EXISTS' : 'NOT FOUND'}`)
  } catch (err) {
    console.error('❌ Error executing SQL script:', err)
  } finally {
    await connectedClient.end()
  }
}

runMigration()
