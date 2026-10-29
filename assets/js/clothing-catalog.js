const catalogUrl = new URL('../../SD-Fit-Full-Clothing-Catalog/catalog.json', import.meta.url);
const catalogRoot = new URL('../../SD-Fit-Full-Clothing-Catalog/', import.meta.url);
const audience = location.pathname.includes('Girls') ? 'girls' : 'boys';
const categorySelect = document.getElementById('catalogCategory');
const searchInput = document.getElementById('catalogSearch');
const grid = document.getElementById('catalogGrid');
const countLabel = document.getElementById('catalogCount');
const moreButton = document.getElementById('catalogMore');
const previewDialog = document.getElementById('catalogPreview');
const selectedIds = new Set();
const pageSize = 24;
let visibleCount = pageSize;
let catalogItems = [];

function itemUrl(item) {
  return new URL(item.relative_path, catalogRoot).href;
}

function itemRoles(item) {
  const path = item.relative_path.toLowerCase();
  const roles = new Set();
  if (path.includes('/topwear/') || path.includes('/tops_kurtis/') || path.includes('/dresses/') || path.includes('/ethnicwear/')) roles.add('top');
  if (path.includes('/bottomwear/') || path.includes('/bottoms_dupatta/') || item.item_id.includes('kurta_pajama')) roles.add('bottom');
  if (path.includes('/jackets/') || path.includes('/hoodies_sweatshirts/') || path.includes('/outerwear/') || item.item_id.includes('nehru_jacket')) roles.add('layer');
  if (path.includes('/footwear/')) roles.add('footwear');
  if (path.includes('/accessories/')) roles.add('accessory');
  if (path.includes('/dresses/')) roles.add('dress');
  return roles;
}

function getCandidates(role, vibe, occasion) {
  let candidates = catalogItems.filter(item => itemRoles(item).has(role));
  const terms = {
    Streetwear: ['oversized', 'baggy', 'cargo', 'hoodie', 'bomber', 'street'],
    Elegant: ['formal', 'blazer', 'linen', 'satin', 'midi', 'palazzo'],
    Minimal: ['white', 'black', 'grey', 'navy', 'straight', 'formal'],
    Casual: ['casual', 'regular', 'straight', 't-shirt', 'tops']
  };
  const occasionTerms = {
    Wedding: ['ethnic', 'kurta', 'sherwani', 'embroidered', 'dupatta', 'lehenga'],
    Interview: ['formal', 'blazer', 'trousers', 'shirt', 'blouse'],
    Party: ['party', 'dress', 'jacket', 'satin', 'heels']
  };
  const preferred = [...(terms[vibe] || []), ...(occasionTerms[occasion] || [])];
  if (preferred.length) {
    const matches = candidates.filter(item => preferred.some(term => `${item.display_name} ${item.category} ${item.relative_path}`.toLowerCase().includes(term)));
    if (matches.length) candidates = matches;
  }
  return candidates;
}

function chooseItem(role, vibe, occasion, usedIds) {
  const candidates = getCandidates(role, vibe, occasion).filter(item => !usedIds.has(item.item_id));
  if (!candidates.length) return null;
  const choice = candidates[Math.floor(Math.random() * candidates.length)];
  usedIds.add(choice.item_id);
  return choice;
}

function buildLook({ occasion, vibe, formula }) {
  const selected = catalogItems.filter(item => selectedIds.has(item.item_id));
  const usedIds = new Set(selected.map(item => item.item_id));
  const look = [...selected];
  const hasRole = role => look.some(item => itemRoles(item).has(role));
  const dressLook = audience === 'girls' && (formula === 'dress' || (['Wedding', 'Party'].includes(occasion) && formula === 'balanced'));

  if (dressLook && !hasRole('dress')) {
    const dress = chooseItem('dress', vibe, occasion, usedIds) || chooseItem('top', vibe, occasion, usedIds);
    if (dress) look.push(dress);
  } else if (!dressLook) {
    if (!hasRole('top')) {
      const top = chooseItem('top', vibe, occasion, usedIds);
      if (top) look.push(top);
    }
    if (!hasRole('bottom')) {
      const bottom = chooseItem('bottom', vibe, occasion, usedIds);
      if (bottom) look.push(bottom);
    }
  }

  if (formula === 'layered' && !hasRole('layer')) {
    const layer = chooseItem('layer', vibe, occasion, usedIds);
    if (layer) look.push(layer);
  }
  if (!hasRole('footwear')) {
    const footwear = chooseItem('footwear', vibe, occasion, usedIds);
    if (footwear) look.push(footwear);
  }

  return {
    id: `catalog-look-${look.map(item => item.item_id).sort().join('-')}`,
    title: `${occasion} · ${vibe} catalog look`,
    items: look
  };
}

function setSelectionCount() {
  const selectedLabel = document.getElementById('catalogSelectionCount');
  selectedLabel.textContent = `${selectedIds.size} selected`;
}

function renderCatalog() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const filtered = catalogItems.filter(item => {
    const categoryMatch = category === 'all' || item.category === category;
    const text = `${item.display_name} ${item.category} ${item.item_id}`.toLowerCase();
    return categoryMatch && (!query || text.includes(query));
  });
  const shown = filtered.slice(0, visibleCount);
  grid.replaceChildren();
  shown.forEach(item => {
    const card = document.createElement('article');
    card.className = 'catalog-item';
    const image = document.createElement('img');
    image.src = item.imageUrl;
    image.alt = `${item.display_name} catalog preview`;
    image.loading = 'lazy';
    image.onerror = () => { image.hidden = true; card.classList.add('catalog-image-missing'); };
    const details = document.createElement('div');
    details.className = 'catalog-item-details';
    const name = document.createElement('strong');
    name.textContent = item.display_name;
    const categoryLabel = document.createElement('span');
    categoryLabel.textContent = item.category;
    const actions = document.createElement('div');
    actions.className = 'catalog-item-actions';
    const preview = document.createElement('button');
    preview.type = 'button';
    preview.dataset.catalogPreview = item.item_id;
    preview.textContent = 'View';
    const add = document.createElement('button');
    add.type = 'button';
    add.dataset.catalogSelect = item.item_id;
    add.setAttribute('aria-pressed', String(selectedIds.has(item.item_id)));
    add.textContent = selectedIds.has(item.item_id) ? 'Added' : 'Add to look';
    actions.append(preview, add);
    details.append(name, categoryLabel, actions);
    card.append(image, details);
    grid.appendChild(card);
  });
  countLabel.textContent = `${filtered.length} ${filtered.length === 1 ? 'piece' : 'pieces'}`;
  moreButton.hidden = shown.length >= filtered.length;
}

function showPreview(item) {
  const image = document.getElementById('catalogPreviewImage');
  image.src = item.imageUrl;
  image.alt = `${item.display_name} catalog preview`;
  document.getElementById('catalogPreviewTitle').textContent = item.display_name;
  document.getElementById('catalogPreviewCategory').textContent = `${item.category} · illustrative catalog tile`;
  previewDialog.showModal();
}

async function initializeCatalog() {
  try {
    const response = await fetch(catalogUrl);
    if (!response.ok) throw new Error(`Catalog request failed (${response.status}).`);
    const catalog = await response.json();
    catalogItems = catalog.items
      .filter(item => item.audience === audience)
      .map(item => ({ ...item, imageUrl: itemUrl(item) }));
    const categories = [...new Set(catalogItems.map(item => item.category))].sort((a, b) => a.localeCompare(b));
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
    window.SDFitCatalog = {
      audience,
      get items() { return catalogItems; },
      get selectedItems() { return catalogItems.filter(item => selectedIds.has(item.item_id)); },
      buildLook
    };
    setSelectionCount();
    renderCatalog();
  } catch (error) {
    console.error('Could not load the clothing catalog.', error);
    countLabel.textContent = 'Catalog unavailable';
    grid.innerHTML = '<p class="catalog-empty">The catalog could not load. Keep the full project folder together and serve it over HTTP.</p>';
  }
}

categorySelect.addEventListener('change', () => { visibleCount = pageSize; renderCatalog(); });
searchInput.addEventListener('input', () => { visibleCount = pageSize; renderCatalog(); });
moreButton.addEventListener('click', () => { visibleCount += pageSize; renderCatalog(); });
grid.addEventListener('click', event => {
  const addButton = event.target.closest('[data-catalog-select]');
  if (addButton) {
    const id = addButton.dataset.catalogSelect;
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
    setSelectionCount();
    renderCatalog();
    return;
  }
  const previewButton = event.target.closest('[data-catalog-preview]');
  if (previewButton) {
    const item = catalogItems.find(candidate => candidate.item_id === previewButton.dataset.catalogPreview);
    if (item) showPreview(item);
  }
});
document.getElementById('catalogPreviewClose').addEventListener('click', () => previewDialog.close());
previewDialog.addEventListener('click', event => { if (event.target === previewDialog) previewDialog.close(); });
document.getElementById('catalogClearSelection').addEventListener('click', () => { selectedIds.clear(); setSelectionCount(); renderCatalog(); });
initializeCatalog();
