-- Add normalized_link column to channels
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS normalized_link TEXT;

-- Deduplicate existing channels by user_id and roughly normalized url, keeping the oldest one
DELETE FROM public.channels a USING (
    SELECT MIN(id) as min_id, user_id, btrim(regexp_replace(lower(channel_link), '^(https?://)?(www\.)?', ''), '/') as norm
    FROM public.channels 
    WHERE channel_link IS NOT NULL
    GROUP BY user_id, btrim(regexp_replace(lower(channel_link), '^(https?://)?(www\.)?', ''), '/')
    HAVING COUNT(*) > 1
) b
WHERE a.user_id = b.user_id 
AND btrim(regexp_replace(lower(a.channel_link), '^(https?://)?(www\.)?', ''), '/') = b.norm
AND a.id <> b.min_id;

-- Update existing records to have a normalized_link
UPDATE public.channels 
SET normalized_link = btrim(regexp_replace(lower(channel_link), '^(https?://)?(www\.)?', ''), '/')
WHERE normalized_link IS NULL AND channel_link IS NOT NULL;

-- Create unique index to enforce one normalized link per user
CREATE UNIQUE INDEX IF NOT EXISTS channels_user_id_normalized_link_idx ON public.channels (user_id, normalized_link) WHERE normalized_link IS NOT NULL;
