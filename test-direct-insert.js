const { neon } = require('@neondatabase/serverless')

const DATABASE_URL =
  'postgresql://neondb_owner:npg_xeEa1HQ2tPWr@ep-raspy-feather-a8r71iuh-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'

async function testDatabaseInsert() {
  try {
    console.log('Testing database insert...')
    const sql = neon(DATABASE_URL)

    const testSlug = 'test-direct-insert-' + Date.now()

    // Test insert
    const result = await sql`
      INSERT INTO scenario (
        slug, locale, name, description, initial_amount, monthly_contribution, 
        annual_return, time_horizon, tags, is_predefined, is_public, created_by
      ) VALUES (
        ${testSlug}, 'en', 'Direct Test Insert', 'Testing direct database insert',
        '1000.00', '200.00', '5.00', 10, ARRAY['test'], false, true, 'test-system'
      ) RETURNING slug, id
    `

    console.log('✅ Insert successful:', result)

    // Test select
    const found = await sql`
      SELECT slug, name, initial_amount, monthly_contribution, annual_return, time_horizon
      FROM scenario 
      WHERE slug = ${testSlug}
    `

    console.log('✅ Select successful:', found)

    // Count total scenarios
    const count = await sql`SELECT COUNT(*) FROM scenario`
    console.log('Total scenarios after insert:', count[0].count)
  } catch (error) {
    console.error('❌ Database insert failed:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      detail: error.detail,
      severity: error.severity,
      position: error.position,
    })
  }
}

testDatabaseInsert()
