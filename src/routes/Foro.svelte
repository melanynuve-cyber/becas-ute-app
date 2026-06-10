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
      <img src="/ours.jpg" alt="OURS" class="logo-ours" />
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

  .logo-ours { height: 100px; width: auto; object-fit: contain; }

  .placeholder-text {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-disabled);
    letter-spacing: 0.02em;
  }

  @media (max-width: 768px) {
    .content { padding: 24px 16px; }
    .placeholder-card { padding: 60px 20px; }
    .logo-ours { height: 80px; }
    .placeholder-text { font-size: 18px; }
  }
</style>
