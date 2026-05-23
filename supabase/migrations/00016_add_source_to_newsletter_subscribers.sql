-- Add source column to newsletter_subscribers table
-- This allows tracking where each subscriber came from (popup, checkout, footer, etc)

ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'unknown';

-- Add index for better query performance when filtering by source
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_source
  ON newsletter_subscribers(source);

-- Add comment for documentation
COMMENT ON COLUMN newsletter_subscribers.source IS 'Source of subscription: popup, checkout, footer, unknown';
