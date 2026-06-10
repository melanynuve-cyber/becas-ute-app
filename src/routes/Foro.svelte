<script>
  // src/routes/Foro.svelte
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated } from '../lib/stores/auth.js'
  import Navbar from '../lib/components/layout/Navbar.svelte'

  onMount(() => {
    if (!get(isAuthenticated)) navigate('/login', { replace: true })
  })

  function handleAlumnoClick() {
    navigate('/foro', { replace: true })
  }
</script>

<svelte:head>
  <title>Foro | Becas UTE</title>
</svelte:head>

<Navbar onAlumnoClick={handleAlumnoClick} />

<main class="main">
  <div class="content">
    <h1 class="page-title">Foro</h1>
    <div class="placeholder-card">
      <svg width="56" height="56" fill="none" stroke="var(--orange)" stroke-width="1.8" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/>
      </svg>
      <p class="placeholder-text">Próximamente</p>
    </div>
  </div>
</main>

<style>
  .main {
    padding-top: 56px;
    min-height: 100vh;
    background: var(--bg-page);
  }

  .content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .page-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

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

  .placeholder-text {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-disabled);
    letter-spacing: 0.02em;
  }

  @media (max-width: 768px) {
    .content { padding: 24px 16px; }
    .placeholder-card { padding: 60px 20px; }
    .placeholder-text { font-size: 18px; }
  }
</style>
