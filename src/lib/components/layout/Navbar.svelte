<script>
  // src/lib/components/layout/Navbar.svelte
  import { 
    navigate, 
    link, 
    useLocation 
  } from 'svelte-routing'
  import {
    logout,
    user,
    isAlumnoDual,
    isCoordinadorDual,
    isCoordinadorCarrera
  } from '../../stores/auth.js'

  export let onAlumnoClick = () => {}

  let sidebarOpen = false
  let dark = false
  const location = useLocation()

  $: esCoordinadorBecas = $user?.roles?.coordinador_becas
  $: esSoporteAdmin = $user?.roles?.admin
  $: esAlumnoDual = $isAlumnoDual
  $: esCoordinadorDual = $isCoordinadorDual
  $: esCoordinadorCarrera = $isCoordinadorCarrera

  let pathname = window.location.pathname
  $: if (sidebarOpen || $location) {
    pathname = window.location.pathname
  }

  function isActive(path) {
    return pathname === path || pathname.startsWith(path + '/')
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function closeSidebar() { 
    sidebarOpen = false 
  }

  function handleOverlayKeydown(e) {
    if (e.key === 'Escape') {
      closeSidebar()
    }
  }

  function toggleDark() {
    dark = !dark
    const themeValue = dark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', themeValue)
  }

  $: queryParams = $location.search || ''
  $: activeBandeja = isActive('/dual/coordinador') && !queryParams.includes('vista=empresas')
  $: activeEmpresas = isActive('/dual/coordinador') && queryParams.includes('vista=empresas')
  $: activeCarreraDirectorio = isActive('/dual/carrera') && !queryParams.includes('vista=grupos')
  $: activeCarreraGrupos = isActive('/dual/carrera') && queryParams.includes('vista=grupos')
  $: activeBecaInterna = isActive('/dashboard') || isActive('/solicitud')
</script>

<header class="navbar">
  <button class="hamburger" on:click={() => sidebarOpen = true} aria-label="Menú">
    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/>
    </svg>
  </button>

  <div class="brand">
    <img src="/UTEG-01.png" alt="Universidad Tecnológica" class="logo-ute" />
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
  <div 
    class="overlay" 
    role="button" 
    tabindex="0" 
    aria-label="Cerrar menú" 
    on:click={closeSidebar} 
    on:keydown={handleOverlayKeydown}
  ></div>
{/if}

<aside class="sidebar" class:open={sidebarOpen}>
  <div class="sidebar-header">
    <img src="/UTEG-01.png" alt="Logo" class="logo-ute" />
  </div>

  <nav class="sidebar-nav">
    
    {#if esSoporteAdmin}
      <span class="nav-section-title">Admin</span>
      <a 
        href="/admin/usuarios" 
        use:link 
        class="nav-item" 
        class:active={isActive('/admin/usuarios')} 
        on:click={closeSidebar}
      >
        <span class="nav-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/>
          </svg>
        </span>
        Control de personal
      </a>
    {/if}

    {#if esCoordinadorBecas || esSoporteAdmin}
      <span class="nav-section-title">Becas</span>
      <a 
        href="/admin/solicitudes" 
        use:link 
        class="nav-item" 
        class:active={isActive('/admin/solicitudes')} 
        on:click={closeSidebar}
      >
        <span class="nav-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/>
          </svg>
        </span>
        Panel de becas
      </a>
    {/if}

    {#if esCoordinadorDual || esCoordinadorCarrera}
      <span class="nav-section-title">Dual</span>
      {#if esCoordinadorDual}
        <a 
          href="/dual/coordinador?vista=empresas" 
          use:link 
          class="nav-item" 
          class:active={activeEmpresas} 
          on:click={closeSidebar}
        >
          <span class="nav-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
            </svg>
          </span>
          Empresas y asignaciones
        </a>
        <a 
          href="/dual/coordinador" 
          use:link 
          class="nav-item" 
          class:active={activeBandeja} 
          on:click={closeSidebar}
        >
          <span class="nav-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/>
            </svg>
          </span>
          Bandeja de reportes
        </a>
      {/if}
      {#if esCoordinadorCarrera}
        <a
          href="/dual/carrera"
          use:link
          class="nav-item"
          class:active={activeCarreraDirectorio}
          on:click={closeSidebar}
        >
          <span class="nav-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
            </svg>
          </span>
          Expedientes y directorio
        </a>
        <a
          href="/dual/carrera?vista=grupos"
          use:link
          class="nav-item"
          class:active={activeCarreraGrupos}
          on:click={closeSidebar}
        >
          <span class="nav-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75-9.75A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
            </svg>
          </span>
          Gestión de grupos
        </a>
      {/if}
    {/if}

    {#if !esCoordinadorBecas && !esSoporteAdmin && !esCoordinadorDual && !esCoordinadorCarrera}
      <span class="nav-section-title">Alumno</span>
      <button 
        class="nav-item" 
        on:click={() => { onAlumnoClick(); closeSidebar() }}
      >
        <span class="nav-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
        </span>
        Perfil
      </button>

      <a 
        href="/dashboard" 
        use:link 
        class="nav-item" 
        class:active={activeBecaInterna} 
        on:click={closeSidebar}
      >
        <span class="nav-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.25 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
        </span>
        Solicitud de Beca Interna
      </a>

      {#if esAlumnoDual}
        <a 
          href="/dual/reportes" 
          use:link 
          class="nav-item" 
          class:active={isActive('/dual/reportes')} 
          on:click={closeSidebar}
        >
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
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg>
      Cerrar Sesión
    </button>
  </div>
</aside>

<style>
  .navbar { 
    position: fixed;
    top: 0; 
    left: 0; 
    right: 0; 
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

  .hamburger:hover { 
    background: var(--bg-page);
  }

  .brand { 
    display: flex; 
    align-items: center; 
    justify-content: center; 
  }

  .theme-btn { 
    background: none; 
    border: none; 
    cursor: pointer;
    padding: 6px; 
    border-radius: 8px; 
    color: var(--text-primary); 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    transition: background 0.15s;
  }

  .theme-btn:hover { 
    background: var(--bg-page); 
  }

  .overlay { 
    position: fixed; 
    inset: 0; 
    background: rgba(0,0,0,0.3); 
    z-index: 200; 
    backdrop-filter: blur(2px);
    cursor: pointer; 
  }

  .sidebar { 
    position: fixed; 
    top: 0; 
    left: 0; 
    bottom: 0; 
    width: 260px; 
    background: var(--bg-card); 
    z-index: 300;
    display: flex; 
    flex-direction: column; 
    transform: translateX(-100%); 
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); 
    box-shadow: 4px 0 20px rgba(0,0,0,0.1);
  }

  .sidebar.open { 
    transform: translateX(0); 
  }

  .sidebar-header { 
    padding: 16px 20px; 
    border-bottom: 1px solid var(--border); 
    display: flex;
    align-items: center; 
  }

  .sidebar-nav { 
    flex: 1; 
    padding: 12px 8px; 
    display: flex; 
    flex-direction: column; 
    gap: 4px;
    overflow-y: auto;
  }

  .nav-section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-disabled);
    margin: 16px 14px 4px;
    display: block;
  }

  .sidebar-nav > .nav-section-title:first-child {
    margin-top: 4px;
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

  .nav-item:hover { 
    background: var(--orange-light); 
    color: var(--orange); 
  }

  .nav-item.active { 
    background: var(--orange-light); 
    color: var(--orange); 
    font-weight: 600;
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

  .logo-ute { 
    height: 44px; 
    width: auto; 
    object-fit: contain; 
  }
</style>