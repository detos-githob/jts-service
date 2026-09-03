/* =========================================================
   JT SERVICE — Affichage public des réalisations (Supabase)
   Utilisé par projets.html (grille complète + filtre) et
   index.html (aperçu des 3 dernières réalisations publiées).
   ========================================================= */

const CATEGORY_LABELS = {
  residentiel: 'Résidentiel',
  tertiaire: 'Tertiaire',
  industriel: 'Industriel',
  photovoltaique: 'Photovoltaïque'
};

// Échappe le texte venant de la base avant de l'insérer dans le DOM.
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function projectCardHTML(project) {
  const label = CATEGORY_LABELS[project.category] || project.category;
  const img = project.image_url
    ? `<img src="${escapeHTML(project.image_url)}" alt="${escapeHTML(project.title)}" loading="lazy">`
    : `<div class="scene"><span class="scene-watermark">Aucune photo</span></div>`;
  return `
    <div class="project-card" data-category="${escapeHTML(project.category)}" data-reveal>
      <div class="project-thumb">
        <span class="project-tag">${escapeHTML(label)}</span>
        ${img}
      </div>
      <div class="project-body">
        ${project.location ? `<span class="loc">${escapeHTML(project.location)}</span>` : ''}
        <h3>${escapeHTML(project.title)}</h3>
        ${project.description ? `<p>${escapeHTML(project.description)}</p>` : ''}
      </div>
    </div>`;
}

function renderInto(container, projects, emptyMessage) {
  if (!container) return;
  if (!projects.length) {
    container.innerHTML = `<p style="color:var(--slate-light); font-family:var(--font-mono); font-size:.85rem;">${emptyMessage}</p>`;
    return;
  }
  container.innerHTML = projects.map(projectCardHTML).join('');
  // Raccorde les nouvelles cartes aux animations et au filtre existants.
  container.querySelectorAll('[data-reveal]').forEach((el, i) => window.JTS?.observeReveal?.(el, i));
  window.JTS?.reapplyActiveFilter?.();
  window.JTS?.refreshSpine?.();
}

async function loadProjects({ limit = null } = {}) {
  if (!jtsSupabase) return [];
  let query = jtsSupabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) {
    console.error('[JT Service] Erreur de chargement des réalisations :', error.message);
    return [];
  }
  return data || [];
}

document.addEventListener('DOMContentLoaded', async () => {
  const fullGrid = document.querySelector('#projects-grid-dynamic');
  const homeGrid = document.querySelector('#home-realisations-grid');

  if (!jtsSupabase) {
    // Supabase pas encore configuré : on laisse le contenu existant tel quel
    // (aucune interruption pour le visiteur — voir SETUP.md).
    return;
  }

  if (fullGrid) {
    const projects = await loadProjects();
    renderInto(fullGrid, projects, 'Aucune réalisation publiée pour le moment.');
  }

  if (homeGrid) {
    const projects = await loadProjects({ limit: 3 });
    if (projects.length) {
      renderInto(homeGrid, projects, '');
    }
    // Si aucune réalisation n'est encore dans Supabase, l'aperçu statique
    // déjà présent sur la page reste affiché tel quel.
  }
});
