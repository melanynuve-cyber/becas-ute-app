<script>
  import { navigate, link } from 'svelte-routing'
  import { logout, user } from '../stores/auth.js'

  export let onAlumnoClick = () => {}

  let sidebarOpen = false

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function closeSidebar() { sidebarOpen = false }
</script>

<!-- Header superior -->
<header class="navbar">
  <button class="hamburger" on:click={() => sidebarOpen = true} aria-label="Menú">
    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/>
    </svg>
  </button>

  <div class="brand">
    <span class="brand-name">Universidad Tecnológica</span>
    <span class="brand-sub">General Mariano Escobedo</span>
  </div>

  <!-- Espacio derecho (decorativo) -->
  <div class="right-slot"></div>
</header>

<!-- Overlay oscuro -->
{#if sidebarOpen}
  <div class="overlay" on:click={closeSidebar} role="button" tabindex="0" on:keydown={(e) => e.key==='Escape' && closeSidebar()} aria-label="Cerrar menú"></div>
{/if}

<!-- Sidebar drawer -->
<aside class="sidebar" class:open={sidebarOpen}>
  <div class="sidebar-header">
    <span class="brand-name">Universidad Tecnológica</span>
    <span class="brand-sub">General Mariano Escobedo</span>
  </div>

  <nav class="sidebar-nav">
    <button class="nav-item" on:click={() => { onAlumnoClick(); closeSidebar() }}>
      <span class="nav-icon">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
        </svg>
      </span>
      Alumno
    </button>

    <a href="/dashboard" use:link class="nav-item" on:click={closeSidebar}>
      <span class="nav-icon">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
        </svg>
      </span>
      Solicitud de Beca Interna
    </a>

    <div class="nav-item disabled">
      <span class="nav-icon">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
        </svg>
      </span>
      Próximamente...
    </div>
  </nav>

  <div class="sidebar-footer">
    <button class="logout-btn" on:click={handleLogout}>
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
      </svg>
      Cerrar Sesión
    </button>
  </div>
</aside>

<style>
  .navbar {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 56px;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    z-index: 100;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .hamburger {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    color: var(--text-primary);
    transition: background 0.15s;
  }
  .hamburger:hover { background: var(--bg-page); }

  .brand {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .brand-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
  .brand-sub  { font-size: 11px; font-weight: 500; color: var(--orange); }

  .right-slot { width: 32px; }

  /* Overlay */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 200;
    backdrop-filter: blur(2px);
  }

  /* Sidebar */
  .sidebar {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    width: 260px;
    background: var(--bg-card);
    z-index: 300;
    display: flex;
    flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 4px 0 20px rgba(0,0,0,0.1);
  }
  .sidebar.open { transform: translateX(0); }

  .sidebar-header {
    padding: 24px 20px 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sidebar-nav {
    flex: 1;
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    border-radius: 10px;
    font-family: var(--font);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
    text-align: left;
    width: 100%;
  }
  .nav-item:hover:not(.disabled) {
    background: var(--orange-light);
    color: var(--orange);
  }
  .nav-item.disabled {
    color: var(--text-disabled);
    cursor: not-allowed;
  }

  .nav-icon {
    display: flex;
    flex-shrink: 0;
  }

  .sidebar-footer {
    padding: 16px 8px 24px;
    border-top: 1px solid var(--border);
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    border-radius: 10px;
    font-family: var(--font);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    transition: background 0.15s, color 0.15s;
  }
  .logout-btn:hover {
    background: #FEF2F2;
    color: var(--error);
  }
</style>
