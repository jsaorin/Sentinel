-- Backfill: each existing warning JSON object gets a `detectedAt` (best
-- approximation: the score row's calculated_at) and an explicit `subject: null`,
-- so the new (code, subject) identity used for carry-over works on legacy data.

UPDATE multisig_score
SET warnings = COALESCE(
  (
    SELECT jsonb_agg(
      elem
        || jsonb_build_object(
          'detectedAt',
          to_char(calculated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
        )
        || jsonb_build_object('subject', COALESCE(elem -> 'subject', 'null'::jsonb))
    )
    FROM jsonb_array_elements(warnings::jsonb) AS elem
  ),
  '[]'::jsonb
)
WHERE jsonb_typeof(warnings::jsonb) = 'array'
  AND jsonb_array_length(warnings::jsonb) > 0;
