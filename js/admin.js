/* =========================================================
   JT SERVICE — Espace admin (connexion + gestion réalisations)
   ========================================================= */

const CATEGORY_LABELS = {
  residentiel: 'Résidentiel',
  tertiaire: 'Tertiaire',
  industriel: 'Industriel',
  photovoltaique: 'Photovoltaïque'
};

const els = {
  configWarning: document.querySelector('#config-warning'),
  loginView: document.querySelector('#login-view'),
  dashboardView: document.querySelector('#dashboard-view'),
  loginForm: document.querySelector('#login-form'),
  loginError: document.querySelector('#login-error'),
  logoutBtn: document.querySelector('#logout-btn'),
  projectForm: document.querySelector('#project-form'),
  formTitle: document.querySelector('#form-title'),
  formMsg: document.querySelector('#form-msg'),
  cancelEditBtn: document.querySelector('#cancel-edit-btn'),
  submitBtn: document.querySelector('#submit-btn'),
  currentImagePreview: document.querySelector('#current-image-preview'),
  list: document.querySelector('#admin-list'),
};

let editingId = null; // null = mode "ajout" ; sinon id de la réalisation en cours d'édition

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

/* ---------- Démarrage ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  if (!jtsSupabase) {
    els.configWarning.classList.add('show');
    els.loginForm.querySelector('button').disabled = true;
    showLogin();
    return;
  }

  const { data: { session } } = await jtsSupabase.auth.getSession();
  if (session) {
    showDashboard();
  } else {
    showLogin();
  }

  jtsSupabase.auth.onAuthStateChange((_event, session) => {
    if (session) showDashboard(); else showLogin();
  });

  els.loginForm.addEventListener('submit', onLogin);
  els.logoutBtn.addEventListener('click', () => jtsSupabase.auth.signOut());
  els.projectForm.addEventListener('submit', onSaveProject);
  els.cancelEditBtn.addEventListener('click', resetForm);
});

function showLogin() {
  els.loginView.style.display = '';
  els.dashboardView.style.display = 'none';
}

async function showDashboard() {
  els.loginView.style.display = 'none';
  els.dashboardView.style.display = '';
  await refreshList();
}

async function onLogin(e) {
  e.preventDefault();
  els.loginError.classList.remove('show');
  const email = document.querySelector('#login-email').value.trim();
  const password = document.querySelector('#login-password').value;
  const { error } = await jtsSupabase.auth.signInWithPassword({ email, password });
  if (error) {
    els.loginError.textContent = "Connexion refusée — vérifiez l'e-mail et le mot de passe.";
    els.loginError.classList.add('show');
  }
}

/* ---------- Liste des réalisations ---------- */
async function refreshList() {
  const { data, error } = await jtsSupabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    els.list.innerHTML = `<p class="admin-empty">Erreur de chargement : ${escapeHTML(error.message)}</p>`;
    return;
  }
  if (!data.length) {
    els.list.innerHTML = `<p class="admin-empty">Aucune réalisation pour le moment — ajoutez la première ci-dessus.</p>`;
    return;
  }

  els.list.innerHTML = data.map(rowHTML).join('');

  data.forEach(project => {
    els.list.querySelector(`[data-edit="${project.id}"]`)
      ?.addEventListener('click', () => startEdit(project));
    els.list.querySelector(`[data-delete="${project.id}"]`)
      ?.addEventListener('click', () => deleteProject(project));
    els.list.querySelector(`[data-toggle="${project.id}"]`)
      ?.addEventListener('click', () => togglePublished(project));
  });
}

function rowHTML(p) {
  const thumb = p.image_url
    ? `<img src="${escapeHTML(p.image_url)}" alt="">`
    : `<span>Pas de photo</span>`;
  return `
    <div class="admin-row">
      <div class="thumb">${thumb}</div>
      <div class="meta">
        <h4>${escapeHTML(p.title)}</h4>
        <div class="tags">
          <span>${escapeHTML(CATEGORY_LABELS[p.category] || p.category)}</span>
          ${p.location ? `<span>${escapeHTML(p.location)}</span>` : ''}
          <span class="status-pill ${p.published ? 'published' : 'draft'}">${p.published ? 'Publié' : 'Brouillon'}</span>
        </div>
      </div>
      <div class="row-actions">
        <button type="button" data-toggle="${p.id}">${p.published ? 'Dépublier' : 'Publier'}</button>
        <button type="button" data-edit="${p.id}">Modifier</button>
        <button type="button" class="btn-delete" data-delete="${p.id}">Supprimer</button>
      </div>
    </div>`;
}

/* ---------- Ajout / modification ---------- */
function startEdit(project) {
  editingId = project.id;
  els.formTitle.textContent = 'Modifier la réalisation';
  els.submitBtn.textContent = 'Enregistrer les modifications';
  els.cancelEditBtn.style.display = '';

  document.querySelector('#f-title').value = project.title || '';
  document.querySelector('#f-category').value = project.category || 'residentiel';
  document.querySelector('#f-location').value = project.location || '';
  document.querySelector('#f-description').value = project.description || '';
  document.querySelector('#f-published').checked = !!project.published;

  if (project.image_url) {
    els.currentImagePreview.classList.add('show');
    els.currentImagePreview.querySelector('img').src = project.image_url;
  } else {
    els.currentImagePreview.classList.remove('show');
  }

  els.projectForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
  editingId = null;
  els.projectForm.reset();
  document.querySelector('#f-published').checked = true;
  els.formTitle.textContent = 'Ajouter une réalisation';
  els.submitBtn.textContent = 'Publier la réalisation';
  els.cancelEditBtn.style.display = 'none';
  els.currentImagePreview.classList.remove('show');
  els.formMsg.classList.remove('show', 'ok', 'err');
}

// Chemin de stockage à partir d'une URL publique Supabase, pour pouvoir
// supprimer l'ancien fichier lors du remplacement d'une photo.
function storagePathFromPublicUrl(url) {
  const marker = '/object/public/project-images/';
  const idx = url?.indexOf(marker);
  return idx > -1 ? url.slice(idx + marker.length) : null;
}

async function uploadImage(file) {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await jtsSupabase.storage.from('project-images').upload(path, file);
  if (error) throw error;
  const { data } = jtsSupabase.storage.from('project-images').getPublicUrl(path);
  return data.publicUrl;
}

async function onSaveProject(e) {
  e.preventDefault();
  els.formMsg.classList.remove('show', 'ok', 'err');
  els.submitBtn.disabled = true;
  const originalLabel = els.submitBtn.textContent;
  els.submitBtn.textContent = 'Enregistrement…';

  try {
    const payload = {
      title: document.querySelector('#f-title').value.trim(),
      category: document.querySelector('#f-category').value,
      location: document.querySelector('#f-location').value.trim(),
      description: document.querySelector('#f-description').value.trim(),
      published: document.querySelector('#f-published').checked,
    };

    const fileInput = document.querySelector('#f-image');
    const file = fileInput.files[0];
    if (file) {
      payload.image_url = await uploadImage(file);
    }

    if (editingId) {
      const { error } = await jtsSupabase.from('projects').update(payload).eq('id', editingId);
      if (error) throw error;
      els.formMsg.textContent = 'Réalisation mise à jour.';
    } else {
      const { error } = await jtsSupabase.from('projects').insert(payload);
      if (error) throw error;
      els.formMsg.textContent = 'Réalisation publiée.';
    }

    els.formMsg.classList.add('show', 'ok');
    resetForm();
    await refreshList();
  } catch (err) {
    els.formMsg.textContent = "Erreur : " + err.message;
    els.formMsg.classList.add('show', 'err');
  } finally {
    els.submitBtn.disabled = false;
    els.submitBtn.textContent = originalLabel;
  }
}

async function togglePublished(project) {
  await jtsSupabase.from('projects').update({ published: !project.published }).eq('id', project.id);
  await refreshList();
}

async function deleteProject(project) {
  if (!confirm(`Supprimer définitivement « ${project.title} » ?`)) return;
  const { error } = await jtsSupabase.from('projects').delete().eq('id', project.id);
  if (error) {
    alert("Erreur lors de la suppression : " + error.message);
    return;
  }
  const path = storagePathFromPublicUrl(project.image_url);
  if (path) {
    await jtsSupabase.storage.from('project-images').remove([path]);
  }
  await refreshList();
}
