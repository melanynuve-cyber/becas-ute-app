<script>
  // src/App.svelte
  // Importaciones
  import { onMount } from 'svelte'
  import { Router, Route, navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import {
    isAuthenticated,
    isAdmin,
    isAlumnoDual,
    isCoordinadorDual,
    isCoordinadorCarrera,
  } from './lib/stores/auth.js'

  import Login              from './routes/Login.svelte'
  import Register           from './routes/Register.svelte'
  import Verificar          from './routes/Verificar.svelte'
  import Dashboard          from './routes/dashboard/Dashboard.svelte'
  import NuevaSolicitud     from './routes/solicitud/NuevaSolicitud.svelte'
  import DetalleSolicitud   from './routes/solicitud/DetalleSolicitud.svelte'
  import AdminSolicitudes   from './routes/admin/AdminSolicitudes.svelte'
  import AdminDetalle       from './routes/admin/AdminDetalle.svelte'
  import GestionUsuarios    from './routes/admin/GestionUsuarios.svelte'
  import ReportesDual       from './routes/dual/ReportesDual.svelte'
  import CoordinadorDual    from './routes/dual/CoordinadorDual.svelte'
  import CoordinadorCarrera from './routes/dual/CoordinadorCarrera.svelte'

  // Redirección principal del sistema
  onMount(() => {
    if (window.location.pathname === '/') {
      if (get(isAuthenticated)) {
        redirectByRole()
      } else {
        navigate('/login', { replace: true })
      }
    }
  })

  // Enrutamiento basado en roles de usuario
  function redirectByRole() {
    if (get(isAdmin)) {
      return navigate('/admin/solicitudes', { replace: true })
    }
    if (get(isCoordinadorDual)) {
      return navigate('/dual/coordinador',  { replace: true })
    }
    if (get(isCoordinadorCarrera)) {
      return navigate('/dual/carrera',      { replace: true })
    }
    navigate('/dashboard', { replace: true })
  }
</script>

<Router url={window.location.pathname}>
  <Route path="/login" component={Login} />
  <Route path="/register" component={Register} />
  <Route path="/verificar" component={Verificar} />

  <Route path="/dashboard" component={Dashboard} />
  <Route path="/solicitud/nueva" component={NuevaSolicitud} />
  <Route path="/solicitud/:id" component={DetalleSolicitud} />

  <Route path="/dual/reportes" component={ReportesDual} />
  <Route path="/dual/coordinador" component={CoordinadorDual} />
  <Route path="/dual/carrera" component={CoordinadorCarrera} />

  <Route path="/admin/solicitudes" component={AdminSolicitudes} />
  <Route path="/admin/solicitudes/:id" component={AdminDetalle} />
  <Route path="/admin/usuarios" component={GestionUsuarios} />
</Router>

<style>
  /* Variables y reseteo CSS */
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(:root) {
    --orange: #F97316;
    --orange-hover: #EA6C00;
    --orange-light: #FFF7ED;
    --orange-mid: #FDBA74;
    
    /* Grises sofisticados con base azulada (Slate) */
    --text-primary: #0F172A;
    --text-secondary: #475569;
    --text-disabled: #94A3B8;
    --bg-page: #F8FAFC;
    --bg-card: #FFFFFF;
    --border: #E2E8F0;
    --border-input: #CBD5E1;
    
    --error: #EF4444;
    --success: #22C55E;
    --blue: #3B82F6;
    
    --radius-card: 16px;
    --radius-input: 10px;
    --radius-btn: 10px;
    --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    --font: 'DM Sans', system-ui, sans-serif;
  }

  /* Modo oscuro */
  :global([data-theme="dark"]) {
    --bg-page: #0B0F19;
    --bg-card: #151D30;
    --border: #1E2942;
    --border-input: #2E3F61;
    --text-primary: #F8FAFC;
    --text-secondary: #94A3B8;
    --text-disabled: #64748B;
    --orange-light: #2C140A;
    --shadow-card: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  }
  
  :global([data-theme="dark"] .input-plain),
  :global([data-theme="dark"] .input-wrap input) {
    background: #1E2942 !important;
    color: var(--text-primary) !important;
    border-color: #2E3F61 !important;
  }

  :global(body) {
    font-family: var(--font);
    background: var(--bg-page);
    color: var(--text-primary);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* Botones primarios estilizados */
  :global(.btn-primary) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px 24px;
    background: var(--orange);
    color: #fff;
    border: none;
    border-radius: var(--radius-btn);
    font-family: var(--font);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(249, 115, 22, 0.2);
  }

  :global(.btn-primary:hover:not(:disabled)) {
    background: var(--orange-hover);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }

  :global(.btn-primary:disabled) {
    background: var(--border-input);
    color: var(--text-disabled);
    cursor: not-allowed;
    box-shadow: none;
  }

  /* Botones outline */
  :global(.btn-outline) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    background: transparent;
    color: var(--text-primary);
    border: 1.5px solid var(--border-input);
    border-radius: var(--radius-btn);
    font-family: var(--font);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  :global(.btn-outline:hover) {
    border-color: var(--orange);
    color: var(--orange);
    background: var(--orange-light);
  }

  /* Inputs refinados */
  :global(.input-group) {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  :global(.input-group label) {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  :global(.input-wrap) {
    position: relative;
    display: flex;
    align-items: center;
  }

  :global(.input-wrap .icon) {
    position: absolute;
    left: 14px;
    color: var(--text-disabled);
    display: flex;
    pointer-events: none;
  }

  :global(.input-wrap input) {
    width: 100%;
    padding: 12px 14px 12px 42px;
    border: 1.5px solid var(--border-input);
    border-radius: var(--radius-input);
    font-family: var(--font);
    font-size: 14px;
    color: var(--text-primary);
    background: var(--bg-card);
    outline: none;
    transition: all 0.15s ease;
  }

  :global(.input-wrap input:focus) { 
    border-color: var(--orange);
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
  }

  :global(.input-plain) {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid var(--border-input);
    border-radius: var(--radius-input);
    font-family: var(--font);
    font-size: 14px;
    color: var(--text-primary);
    background: var(--bg-card);
    outline: none;
    transition: all 0.15s ease;
  }

  :global(.input-plain:focus) { 
    border-color: var(--orange);
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
  }

  /* Mensajes de error */
  :global(.error-msg) {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: var(--error);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 500;
  }

  :global([data-theme="dark"] .error-msg) {
    background: #2D1414;
    border-color: #4C1D1D;
  }

  /* Enlaces de sistema */
  :global(.link-orange) {
    color: var(--orange);
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }

  :global(.link-orange:hover) {
    text-decoration: underline;
  }

  /* Etiquetas de estado */
  :global(.badge) {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid transparent;
  }

  :global(.badge-pendiente) {
    background: rgba(249, 115, 22, 0.08);
    color: #F97316;
    border-color: rgba(249, 115, 22, 0.2);
  }

  :global(.badge-en_revision) {
    background: rgba(59, 130, 246, 0.08);
    color: #3B82F6;
    border-color: rgba(59, 130, 246, 0.2);
  }

  :global(.badge-aprobada) {
    background: rgba(34, 197, 94, 0.08);
    color: #22C55E;
    border-color: rgba(34, 197, 94, 0.2);
  }

  :global(.badge-rechazada) {
    background: rgba(239, 68, 68, 0.08);
    color: #EF4444;
    border-color: rgba(239, 68, 68, 0.2);
  }
</style>
