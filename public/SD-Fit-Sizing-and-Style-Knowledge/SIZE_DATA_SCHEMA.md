# Suggested production data schema

## Product chart
Store `brand`, `product_id`, `category`, `size_system`, `garment_measurements_cm`, `fabric_stretch`, `fit_label`, `size_chart_url`, `return_policy_url`, and `last_verified_at`.

## Recommendation order
1. Product-specific chart.
2. Compare all measurements relevant to that garment.
3. Apply the user's slim/regular/relaxed/oversized preference only after chart matching.
4. If measurements conflict or no chart is available, state uncertainty instead of inventing a size.

## Privacy and UX
Make measurements editable and deletable. Collect only what's needed. Use inclusive, non-judgmental wording such as “You may like to try…”. Body shape does not determine clothing size.
