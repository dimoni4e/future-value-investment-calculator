#!/bin/bash

# Database Setup Script for Future Value Investment Calculator
# This script sets up the Neon Postgres database with schema and seed data

echo "🚀 Setting up Future Value Investment Calculator Database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "Please add your Neon database connection string to .env.local"
    echo "Example: DATABASE_URL=\"postgresql://username:password@ep-example-123456.region.neon.tech/future_value_calculator?sslmode=require\""
    exit 1
fi

echo "✅ DATABASE_URL is set"

# Run schema migrations
echo "📝 Running database schema setup..."
psql $DATABASE_URL -f database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema created successfully"
else
    echo "❌ Failed to create database schema"
    exit 1
fi

# Run seed data
echo "🌱 Running database seed data..."
psql $DATABASE_URL -f database/seed.sql

if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully"
else
    echo "❌ Failed to seed database"
    exit 1
fi

echo "🎉 Database setup completed successfully!"
echo "Your database now contains:"
echo "   - Home page content in 3 languages (EN, PL, ES)"
echo "   - 7+ predefined investment scenarios in 3 languages" 
echo "   - Static pages (About, Contact) in 3 languages"
echo ""
echo "🔧 Next steps:"
echo "   1. Update your DATABASE_URL in .env.local with actual Neon credentials"
echo "   2. Run 'npm run dev' to start the development server"
echo "   3. Visit http://localhost:3000 to see your app with database content"
