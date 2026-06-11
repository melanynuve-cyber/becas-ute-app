<script>
  // src/routes/Foro.svelte
  import { onMount } from 'svelte'
  import { navigate, link } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isCoordinadorBecas } from '../lib/stores/auth.js'
  import { api } from '../lib/services/api.js'
  import Navbar from '../lib/components/layout/Navbar.svelte'
  import PerfilModal from '../lib/components/layout/PerfilModal.svelte'
  import LoadingSpinner from '../lib/components/ui/LoadingSpinner.svelte'

  let alumno = null
  let loading = true
  let loadError = false
  let showPerfil = false

  onMount(async () => {
    if (!get(isAuthenticated)) {
      navigate('/login', { replace: true })
      return
    }
    if (get(isCoordinadorBecas)) {
      navigate('/admin/solicitudes', { replace: true })
      return
    }
    try {
      alumno = await api.alumno.me()
    } catch (e) {
      loadError = true
    } finally {
      loading = false
    }
  })

  // Categorías simuladas para el cascarón visual del foro
  const categorias = [
    { id: 'anuncios', nombre: 'Anuncios', temas: 12, descripcion: 'Comunicados oficiales de la universidad' },
    { id: 'becas', nombre: 'Becas y Convocatorias', temas: 8, descripcion: 'Información sobre becas internas y externas' },
    { id: 'dual', nombre: 'Formación Dual', temas: 15, descripcion: 'Reportes, empresas y experiencias duales' },
    { id: 'academico', nombre: 'Académico', temas: 23, descripcion: 'Dudas sobre materias, horarios y trámites' },
    { id: 'egresados', nombre: 'Egresados', temas: 6, descripcion: 'Bolsa de trabajo y seguimiento de egresados' },
    { id: 'comunidad', nombre: 'Comunidad', temas: 31, descripcion: 'Presentaciones, eventos y networking' },
  ]
</script>

<svelte:head>
  <title>Foro | Becas UTE</title>
</svelte:head>

<Navbar onAlumnoClick={() => showPerfil = true} />
<PerfilModal bind:show={showPerfil} {alumno} />

<main class="main">
  {#if loading}
    <div class="loading-wrap">
      <LoadingSpinner />
      <p class="loading-text">Cargando foro...</p>
    </div>
  {:else if loadError}
    <div class="content">
      <h1 class="page-title">Foro</h1>
      <div class="placeholder-card">
        <img src="/ours.png" alt="OURS" class="logo-ours" />
        <p class="placeholder-text">Próximamente</p>
      </div>
    </div>
  {:else}
    <div class="content">
      <!-- Encabezado -->
      <div class="forum-hero">
        <div class="hero-top">
          <div>
            <h1 class="page-title">Foro</h1>
            <p class="hero-sub">Conecta con la comunidad UTE</p>
          </div>
          <span class="pronto-badge">Próximamente</span>
        </div>
        <!-- Barra de búsqueda decorativa -->
        <div class="search-bar">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
          </svg>
          <span class="search-placeholder">Buscar en el foro...</span>
        </div>
      </div>

      <!-- Stats rápidas -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-num">{categorias.reduce((s, c) => s + c.temas, 0)}</span>
          <span class="stat-label">Temas</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{categorias.length}</span>
          <span class="stat-label">Categorías</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">—</span>
          <span class="stat-label">Miembros</span>
        </div>
      </div>

      <!-- Grid de categorías -->
      <h2 class="section-title">Categorías</h2>
      <div class="categories-grid">
        {#each categorias as cat}
          <button class="category-card" disabled>
            <span class="cat-icon">
              {#if cat.id === 'anuncios'}
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.15.087a1.242 1.242 0 01-1.668-.513 21.452 21.452 0 01-.899-2.205m5.713-7.663c.253-.962.584-1.892.985-2.783a1.242 1.242 0 011.668-.513l.15.087c.524.3.71.961.464 1.511a21.45 21.45 0 01-.9 2.205m-1.367 7.663c.688.06 1.386.09 2.09.09h.75a4.5 4.5 0 000-9h-.75c-.704 0-1.402-.03-2.09-.09"/>
                </svg>
              {:else if cat.id === 'becas'}
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              {:else if cat.id === 'dual'}
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"/>
                </svg>
              {:else if cat.id === 'academico'}
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                </svg>
              {:else if cat.id === 'egresados'}
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/>
                </svg>
              {:else if cat.id === 'comunidad'}
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
                </svg>
              {/if}
            </span>
            <div class="cat-info">
              <span class="cat-name">{cat.nombre}</span>
              <span class="cat-desc">{cat.descripcion}</span>
            </div>
            <span class="cat-count">{cat.temas}</span>
          </button>
        {/each}
      </div>

      <!-- Footer decorativo -->
      <p class="forum-footer-text">
        El foro estará disponible pronto. Mientras tanto, usa <a href="/dashboard" use:link class="footer-link">Solicitud de Beca</a> para tus trámites.
      </p>
    </div>
  {/if}
</main>

<style>
  .main {
    padding-top: 56px;
    min-height: 100vh;
    background: var(--bg-page);
  }

  /* Loading */
  .loading-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 56px);
    gap: 16px;
  }
  .loading-text {
    font-size: 14px;
    color: var(--text-secondary);
  }

  /* Contenido */
  .content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 36px 24px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  /* Hero */
  .forum-hero {
    background: var(--bg-card);
    border-radius: var(--radius-card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card);
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .hero-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }
  .page-title {
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }
  .hero-sub {
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 4px;
  }
  .pronto-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    background: var(--orange-light);
    color: var(--orange);
    border: 1px solid var(--orange-mid);
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Search bar decorativa */
  .search-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg-page);
    border: 1.5px solid var(--border-input);
    border-radius: var(--radius-input);
    color: var(--text-disabled);
    cursor: not-allowed;
  }
  .search-placeholder {
    font-size: 14px;
    color: var(--text-disabled);
  }

  /* Stats */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  .stat-card {
    background: var(--bg-card);
    border-radius: var(--radius-card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card);
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .stat-num {
    font-size: 26px;
    font-weight: 700;
    color: var(--orange);
  }
  .stat-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Section title */
  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  /* Categorías grid */
  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 12px;
  }
  .category-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    cursor: not-allowed;
    opacity: 0.7;
    transition: opacity 0.2s, border-color 0.2s, box-shadow 0.2s;
    text-align: left;
    font-family: var(--font);
    color: var(--text-primary);
    width: 100%;
  }
  .category-card:hover {
    opacity: 0.9;
    border-color: var(--orange-mid);
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.08);
  }
  .cat-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-page);
    border-radius: 10px;
    color: var(--orange);
  }
  .cat-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .cat-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }
  .cat-desc {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cat-count {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-disabled);
    background: var(--bg-page);
    border-radius: 8px;
    padding: 4px 10px;
    flex-shrink: 0;
  }

  /* Footer */
  .forum-footer-text {
    text-align: center;
    font-size: 13px;
    color: var(--text-disabled);
    padding-top: 4px;
  }
  .footer-link {
    color: var(--orange);
    font-weight: 600;
    text-decoration: none;
  }
  .footer-link:hover {
    text-decoration: underline;
  }

  /* Placeholder (error) */
  .placeholder-card {
    background: var(--bg-card);
    border-radius: var(--radius-card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card);
    padding: 80px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }
  .logo-ours { height: 100px; width: auto; object-fit: contain; }
  .placeholder-text {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-disabled);
    letter-spacing: 0.02em;
  }

  @media (max-width: 768px) {
    .content { padding: 24px 16px; }
    .forum-hero { padding: 20px; }
    .page-title { font-size: 22px; }
    .stats-row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .stat-card { padding: 14px 10px; }
    .stat-num { font-size: 22px; }
    .categories-grid { grid-template-columns: 1fr; }
    .placeholder-card { padding: 60px 20px; }
    .logo-ours { height: 80px; }
    .placeholder-text { font-size: 18px; }
  }
</style>
