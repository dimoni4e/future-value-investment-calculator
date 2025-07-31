const { neon } = require('@neondatabase/serverless')

const DATABASE_URL =
  'postgresql://neondb_owner:npg_xeEa1HQ2tPWr@ep-raspy-feather-a8r71iuh-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'

async function testDatabase() {
  try {
    console.log('Testing database connection...')
    const sql = neon(DATABASE_URL)

    // Check if scenario table exists
    console.log('\n1. Checking if scenario table exists...')
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'scenario'
      );
    `
    console.log('Scenario table exists:', tableExists[0].exists)

    if (tableExists[0].exists) {
      // Get table structure
      console.log('\n2. Getting table structure...')
      const structure = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'scenario'
        ORDER BY ordinal_position;
      `
      console.log('Table structure:', structure)

      // Count total scenarios
      console.log('\n3. Counting scenarios...')
      const count = await sql`SELECT COUNT(*) FROM scenario`
      console.log('Total scenarios:', count[0].count)

      // Get all scenarios
      console.log('\n4. Getting all scenarios...')
      const scenarios = await sql`
        SELECT id, slug, locale, name, initial_amount, monthly_contribution, annual_return, time_horizon, created_at 
        FROM scenario 
        ORDER BY created_at DESC 
        LIMIT 10
      `
      console.log('Recent scenarios:', scenarios)

      // Check for specific scenarios mentioned
      console.log('\n5. Checking for specific scenarios...')
      const specificScenarios = await sql`
        SELECT slug, locale, created_at 
        FROM scenario 
        WHERE slug IN (
          'invest-2000-monthly-1000-8percent-15years-retirement',
          'invest-2000-monthly-300-6percent-15years-retirement', 
          'invest-3000-monthly-400-7percent-20years-education'
        )
        ORDER BY created_at DESC
      `
      console.log('Specific scenarios found:', specificScenarios)
    }

    console.log('\nDatabase test completed successfully!')
  } catch (error) {
    console.error('Database test failed:', error)
  }
}

testDatabase()
