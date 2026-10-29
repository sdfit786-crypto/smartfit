// SD Fit starter helper. Use product-specific brand charts for actual sizing.
export function matchMeasurementToChart(valueCm, chartRows, field) {
  if (!Number.isFinite(valueCm) || !Array.isArray(chartRows)) {
    return { status: "needs_measurements", sizes: [] };
  }
  const matches = chartRows.filter(row =>
    Array.isArray(row[field]) && valueCm >= row[field][0] && valueCm <= row[field][1]
  );
  if (matches.length === 1) return {
    status: "chart_match", sizes: [matches[0].size],
    note: "Check all other relevant measurements and fit preference."
  };
  if (matches.length > 1) return {
    status: "multiple_matches", sizes: matches.map(row => row.size),
    note: "Use the product chart, garment cut, stretch, and user's fit preference."
  };
  return { status: "no_chart_match", sizes: [],
    note: "No reliable match. Check the brand's full chart or remeasure." };
}

export function getStyleIdeas(shapeId, shapesForAudience) {
  const shape = shapesForAudience.find(item => item.id === shapeId);
  if (!shape) return { ideas: [], note: "Choose a shape or skip this step." };
  return { ideas: shape.ideas, fitChecks: shape.fit,
    note: "Optional style inspiration only; body shape does not determine size." };
}
