# Database Seed Files

This directory contains the seed files for initializing the database with test data.

## Files

- `00_auth.sql`: Creates test user accounts
  - `test@example.com` (with test data)
  - `nodata@example.com` (empty account)
  - Both accounts use password: `password123`
- `01_categories.sql`: Creates sample categories for the test account
- `02_decks.sql`: Creates sample decks within those categories
- `03_cards.sql`: Creates sample flashcards within the decks
- `04_review_logs.sql`: Creates sample review history data

## Running the Seeds

1. Start the Supabase services:
   ```bash
   npm run db:start
   ```

2. Wait for all services to be healthy (this may take a minute)

3. Run the seed files:
   ```bash
   npm run db:seed
   ```

## Hard Reset

To completely reset the database and reseed (useful if things get corrupted):
```bash
npm run db:hardreset
```

## Test Accounts

1. Account with sample data:
   - Email: `test@example.com`
   - Password: `password123`
   - Has categories, decks, cards, and review history

2. Empty account:
   - Email: `nodata@example.com`
   - Password: `password123`
   - Fresh account with no data (useful for testing empty states) 