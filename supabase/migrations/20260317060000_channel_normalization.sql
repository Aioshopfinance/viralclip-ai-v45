-- Add normalized_link column to channels
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS normalized_link TEXT;

-- Deduplicate existing channels by user_id and roughly normalized url, keeping the oldest one
DELETE FROM public.channels
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY user_id, btrim(regexp_replace(lower(channel_link), '^(https?://)?(www\.)?', ''), '/')
      ORDER BY created_at ASC
    ) as rnum
    FROM public.channels
    WHERE channel_link IS NOT NULL
  ) t
  WHERE t.rnum > 1
);

-- Update existing records to have a normalized_link
UPDATE public.channels 
SET normalized_link = btrim(regexp_replace(lower(channel_link), '^(https?://)?(www\.)?', ''), '/')
WHERE normalized_link IS NULL AND channel_link IS NOT NULL;

-- Create unique index to enforce one normalized link per user
CREATE UNIQUE INDEX IF NOT EXISTS channels_user_id_normalized_link_idx ON public.channels (user_id, normalized_link) WHERE normalized_link IS NOT NULL;
