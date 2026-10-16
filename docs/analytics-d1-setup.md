# EDUKEN analytics D1 setup

The Worker must use separate databases for production and preview deployments.

- Production: `eduken-analytics-production` (`fb684d86-f289-4cee-aa34-5767f8c08094`)
- Preview: `eduken-analytics-preview` (`ec1f170c-c00d-4975-a6ca-bb35958772f6`)

The production D1 database and preview D1 database were verified through the connected Cloudflare account. The initial inspection found no tables in either database, so the analytics schema is not yet applied.

## Before production deployment

1. Review `migrations/0001_analytics.sql`.
2. Back up or otherwise confirm recovery options for the production D1 database.
3. Apply the migration to the production database only after explicit approval.
4. Confirm the `analytics_events` table and indexes exist.
5. Deploy the Worker and run read-only health checks.

## Preview testing

Apply the same migration to the separate preview database before testing analytics writes in a preview environment. Never point a preview Worker at the production database.

No database migration is executed by this documentation or by the code changes alone.
