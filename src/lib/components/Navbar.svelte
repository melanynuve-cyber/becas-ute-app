<script>
  import { navigate, link } from 'svelte-routing'
  import { logout, isAdmin, isAlumnoDual, isAgenteDual } from '../stores/auth.js'

  export let onAlumnoClick = () => {}

  let sidebarOpen = false
  let dark = false
  let esAdmin = false
  let esAlumnoDual = false
  let esAgenteDual = false

  isAdmin.subscribe(val => esAdmin = val)
  isAlumnoDual.subscribe(val => esAlumnoDual = val)
  isAgenteDual.subscribe(val => esAgenteDual = val)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function closeSidebar() { sidebarOpen = false }

  function toggleDark() {
    dark = !dark
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }
</script>

<header class="navbar">
  <button class="hamburger" on:click={() => sidebarOpen = true} aria-label="Menú">
    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/>
    </svg>
  </button>

  <div class="brand">
    <img src="/UTEG-01.png" alt="Universidad Tecnológica Gral. Mariano Escobedo" class="logo-ute" />
  </div>

  <button class="theme-btn" on:click={toggleDark} aria-label="Cambiar tema">
    {#if dark}
      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4"/>
        <path stroke-linecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    {:else}
      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
      </svg>
    {/if}
  </button>
</header>

{#if sidebarOpen}
  <div class="overlay" on:click={closeSidebar} role="button" tabindex="0"
    on:keydown={(e) => e.key === 'Escape' && closeSidebar()} aria-label="Cerrar menú">
  </div>
{/if}

<aside class="sidebar" class:open={sidebarOpen}>
  <div class="sidebar-header">
    <img src="/UTEG-01.png" alt="Universidad Tecnológica Gral. Mariano Escobedo" class="logo-ute" />
  </div>

  <nav class="sidebar-nav">
    {#if esAdmin}
      <a href="/admin/solicitudes" use:link class="nav-item" on:click={closeSidebar}>
        <span class="nav-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/>
          </svg>
        </span>
        Panel Admin
      </a>

    {:else if esAgenteDual}
      <!-- Agente dual: solo ve su bandeja -->
      <a href="/dual/agente" use:link class="nav-item" on:click={closeSidebar}>
        <span class="nav-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/>
          </svg>
        </span>
        Bandeja Dual
      </a>

    {:else}
      <!-- Alumno (normal o dual) -->
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.25 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
          </svg>
        </span>
        Solicitud de Beca Interna
      </a>

      {#if esAlumnoDual}
        <a href="/dual/reportes" use:link class="nav-item" on:click={closeSidebar}>
          <span class="nav-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"/>
            </svg>
          </span>
          Reportes Dual
        </a>
      {/if}
    {/if}
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
    background: none; border: none; cursor: pointer;
    padding: 6px; border-radius: 8px; color: var(--text-primary);
    transition: background 0.15s;
  }
  .hamburger:hover { background: var(--bg-page); }
  .brand { display: flex; align-items: center; justify-content: center; }
  .theme-btn {
    background: none; border: none; cursor: pointer;
    padding: 6px; border-radius: 8px; color: var(--text-primary);
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .theme-btn:hover { background: var(--bg-page); }
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.3); z-index: 200;
    backdrop-filter: blur(2px);
  }
  .sidebar {
    position: fixed; top: 0; left: 0; bottom: 0;
    width: 260px; background: var(--bg-card); z-index: 300;
    display: flex; flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 4px 0 20px rgba(0,0,0,0.1);
  }
  .sidebar.open { transform: translateX(0); }
  .sidebar-header {
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
  }
  .sidebar-nav {
    flex: 1; padding: 12px 8px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 10px;
    font-family: var(--font); font-size: 14px; font-weight: 500;
    color: var(--text-primary); background: none; border: none;
    cursor: pointer; text-decoration: none;
    transition: background 0.15s, color 0.15s;
    text-align: left; width: 100%;
  }
  .nav-item:hover { background: var(--orange-light); color: var(--orange); }
  .nav-icon { display: flex; flex-shrink: 0; }
  .sidebar-footer { padding: 16px 8px 24px; border-top: 1px solid var(--border); }
  .logout-btn {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 10px;
    font-family: var(--font); font-size: 14px; font-weight: 500;
    color: var(--text-secondary); background: none; border: none;
    cursor: pointer; width: 100%;
    transition: background 0.15s, color 0.15s;
  }
  .logout-btn:hover { background: #FEF2F2; color: var(--error); }
  .logo-ute { height: 44px; width: auto; object-fit: contain; }
</style>
