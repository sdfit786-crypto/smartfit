const knowledgeUrl = new URL('../../SD-Fit-Sizing-and-Style-Knowledge/sd-fit-sizing-style-knowledge.json', import.meta.url);
let knowledgePromise;

async function loadKnowledge() {
  knowledgePromise ??= fetch(knowledgeUrl).then(response => {
    if (!response.ok) throw new Error(`Could not load sizing knowledge (${response.status}).`);
    return response.json();
  });
  return knowledgePromise;
}

export async function matchIllustrativeSize(audience, measurements, garment = 'outfit') {
  const knowledge = await loadKnowledge();
  const sizeBands = knowledge.illustrative_body_size_bands[audience];
  if (!Array.isArray(sizeBands)) throw new Error(`No size bands are available for ${audience}.`);

  const primaryField = audience === 'girls' ? 'bust_cm' : 'chest_cm';
  const primaryValue = Number(measurements.primary);
  const waistValue = Number(measurements.waist);
  const hipsValue = Number(measurements.hips);
  const fields = garment === 'top'
    ? [[primaryField, primaryValue]]
    : garment === 'bottom'
      ? [['waist_cm', waistValue], ['hips_cm', hipsValue]]
      : [[primaryField, primaryValue], ['waist_cm', waistValue], ['hips_cm', hipsValue]];

  if (fields.some(([, value]) => !Number.isFinite(value) || value <= 0)) {
    return { status: 'needs_measurements', sizes: [], warning: knowledge.meta.warning };
  }

  const matches = sizeBands.filter(row => fields.every(([field, value]) => {
    const range = row[field];
    return Array.isArray(range) && value >= range[0] && value <= range[1];
  }));

  return {
    status: matches.length === 1 ? 'chart_match' : matches.length ? 'multiple_matches' : 'no_chart_match',
    sizes: matches.map(row => row.size),
    measurementsUsed: fields.map(([field]) => field.replace('_cm', '')),
    warning: knowledge.meta.warning
  };
}

export async function getShapeAdvice(audience, shapeId) {
  const knowledge = await loadKnowledge();
  const shape = knowledge.body_shapes[audience]?.find(item => item.id === shapeId);
  return shape ? { ...shape, warning: knowledge.meta.warning } : null;
}

export function classifyBodyShape(audience, measurements) {
  const shoulder = Number(measurements.shoulder);
  const primary = Number(measurements.primary);
  const waist = Number(measurements.waist);
  const hips = Number(measurements.hips);
  if ([shoulder, primary, waist, hips].some(value => !Number.isFinite(value) || value <= 0)) return null;

  if (audience === 'girls') {
    const upper = Math.max(shoulder, primary);
    if (waist >= primary * 0.95 && waist >= hips * 0.95) return 'apple';
    if (Math.abs(primary - hips) / Math.max(primary, hips) < 0.08 && waist < primary * 0.78) return 'hourglass';
    if (hips > upper * 1.05) return 'pear';
    if (upper > hips * 1.08) return 'inverted_triangle';
    return 'rectangle';
  }

  if (hips > Math.max(shoulder, primary) * 1.05) return 'triangle';
  if (shoulder > hips * 1.08 && shoulder > waist * 1.12) return 'inverted_triangle';
  if (waist >= primary * 0.95 && waist >= hips * 0.95) return 'oval';
  if (primary > waist * 1.12 && primary > hips * 1.08) return 'trapezoid';
  return 'rectangle';
}

export async function getShapeOptions(audience) {
  const knowledge = await loadKnowledge();
  return knowledge.body_shapes[audience] || [];
}
