# SD Fit Sizing & Style Knowledge Pack

## Included
- `sd-fit-sizing-style-knowledge.json`: complete structured knowledge base
- `boys_size_bands.csv` and `girls_size_bands.csv`: approximate adult XS–XXL measurement bands
- `illustrative_top_size_chart.csv`: starter top chart ranges
- `body_shape_style_recommendations.csv`: shape descriptions, optional outfit ideas and fit checks
- `integration-example.js`: small website integration helpers
- `SIZE_DATA_SCHEMA.md`: recommended product/profile schema and accuracy workflow

## Recommended implementation
1. Collect only measurements needed for the chosen item and explain why.
2. Store each product's actual brand-specific chart, size system, fabric stretch and fit label.
3. Compare relevant measurements against that chart before recommending a size.
4. Use shape labels for optional style inspiration only, not to assign sizes.
5. Show why a size was suggested and let the user edit/override it.

## Accuracy limitation
There is no universal clothing size standard. These included bands are illustrative starting data, not guaranteed fits. Brand, region, garment cut, fabric and ease vary. Shoe sizes must be matched using foot length and the shoe brand's own chart.
