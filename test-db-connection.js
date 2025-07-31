const { neon } = require('@neondatabase/serverless')

// Test the database connection using the DATABASE_URL from .env.local
const DATABASE_URL =
  'postgresql://neondb_owner:npg_xeEa1HQ2tPWr@ep-raspy-feather-a8r71iuh-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'

async function testConnection() {
  try {
    console.log('Testing database connection...')
    const sql = neon(DATABASE_URL)

    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`
    console.log('✅ Database connection successful')
    console.log('Current time:', result[0].current_time)

    // Check if scenarios table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'scenarios'
      );
    `
    console.log('✅ Scenarios table exists:', tableCheck[0].exists)

    // Count scenarios
    const count = await sql`SELECT COUNT(*) as count FROM scenarios`
    console.log('✅ Total scenarios in database:', count[0].count)

    // List some scenarios
    const scenarios = await sql`
      SELECT slug, locale, created_at 
      FROM scenarios 
      WHERE slug LIKE 'invest-2000%' OR slug LIKE 'invest-3000%'
      ORDER BY created_at DESC 
      LIMIT 5
    `
    console.log('✅ Recent scenarios matching your criteria:')
    scenarios.forEach((scenario) => {
      console.log(
        `  - ${scenario.slug} (${scenario.locale}) created: ${scenario.created_at}`
      )
    })
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

testConnection()
