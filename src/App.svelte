<script>
  import { onMount } from 'svelte'
  import { Router, Route, navigate } from 'svelte-routing'
  import { isAuthenticated, isAdmin } from './lib/stores/auth.js'

  import Login      from './routes/login/Login.svelte'
  import Register   from './routes/register/Register.svelte'
  import Verificar  from './routes/verificar/Verificar.svelte'
  import Dashboard  from './routes/dashboard/Dashboard.svelte'
  import NuevaSolicitud from './routes/solicitud/NuevaSolicitud.svelte'
  import DetalleSolicitud from './routes/solicitud/DetalleSolicitud.svelte'
  import AdminSolicitudes from './routes/admin/solicitudes/AdminSolicitudes.svelte'
  import AdminDetalle from './routes/admin/solicitudes/AdminDetalle.svelte'

 onMount(() => {
    if (window.location.pathname === '/') {
      navigate('/login', { replace: true })
    }
  })
</script>

<Router url={window.location.pathname}>
  <!-- Públicas -->
  <Route path="/login"    component={Login} />
  <Route path="/register" component={Register} />
  <Route path="/verificar" component={Verificar} />

  <!-- Estudiante -->
  <Route path="/dashboard"       component={Dashboard} />
  <Route path="/solicitud/nueva" component={NuevaSolicitud} />
  <Route path="/solicitud/:id"   component={DetalleSolicitud} />

  <!-- Admin -->
  <Route path="/admin/solicitudes"     component={AdminSolicitudes} />
  <Route path="/admin/solicitudes/:id" component={AdminDetalle} />
</Router>

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(:root) {
    --orange:        #F97316;
    --orange-hover:  #EA6C00;
    --orange-light:  #FFF7ED;
    --orange-mid:    #FDBA74;
    --text-primary:  #1F2937;
    --text-secondary:#6B7280;
    --text-disabled: #9CA3AF;
    --bg-page:       #F3F4F6;
    --bg-card:       #FFFFFF;
    --border:        #E5E7EB;
    --border-input:  #D1D5DB;
    --error:         #EF4444;
    --success:       #22C55E;
    --blue:          #3B82F6;
    --radius-card:   14px;
    --radius-input:  8px;
    --radius-btn:    8px;
    --shadow-card:   0 1px 8px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.04);
    --font:          'DM Sans', system-ui, sans-serif;
  }

  :global([data-theme="dark"]) {
  --bg-page:    #111827;
  --bg-card:    #1F2937;
  --border:     #374151;
  --border-input: #4B5563;
  --text-primary:   #F9FAFB;
  --text-secondary: #9CA3AF;
  --text-disabled:  #6B7280;
  --orange-light:   #431407;
  --shadow-card: 0 1px 8px rgba(0,0,0,0.4);
}
:global([data-theme="dark"] .input-plain),
:global([data-theme="dark"] .input-wrap input) {
  background: #374151;
  color: var(--text-primary);
  border-color: #4B5563;
}

  :global(body) {
    font-family: var(--font);
    background: var(--bg-page);
    color: var(--text-primary);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Botones globales ── */
  :global(.btn-primary) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 13px 20px;
    background: var(--orange);
    color: #fff;
    border: none;
    border-radius: var(--radius-btn);
    font-family: var(--font);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s, opacity 0.15s;
  }
  :global(.btn-primary:hover:not(:disabled)) {
    background: var(--orange-hover);
    transform: translateY(-1px);
  }
  :global(.btn-primary:active:not(:disabled)) {
    transform: translateY(0);
  }
  :global(.btn-primary:disabled) {
    background: var(--border-input);
    color: var(--text-disabled);
    cursor: not-allowed;
  }

  :global(.btn-outline) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px 20px;
    background: transparent;
    color: var(--text-primary);
    border: 1.5px solid var(--border-input);
    border-radius: var(--radius-btn);
    font-family: var(--font);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  :global(.btn-outline:hover) {
    border-color: var(--orange);
    color: var(--orange);
    background: var(--orange-light);
  }

  /* ── Inputs globales ── */
  :global(.input-group) {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  :global(.input-group label) {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }
  :global(.input-wrap) {
    position: relative;
    display: flex;
    align-items: center;
  }
  :global(.input-wrap .icon) {
    position: absolute;
    left: 12px;
    color: var(--text-disabled);
    display: flex;
    pointer-events: none;
  }
  :global(.input-wrap input) {
    width: 100%;
    padding: 11px 14px 11px 38px;
    border: 1.5px solid var(--border-input);
    border-radius: var(--radius-input);
    font-family: var(--font);
    font-size: 14px;
    color: var(--text-primary);
    background: #fff;
    outline: none;
    transition: border-color 0.15s;
  }
  :global(.input-wrap input:focus) {
    border-color: var(--orange);
  }
  :global(.input-wrap input::placeholder) {
    color: var(--text-disabled);
  }
  :global(.input-wrap input:disabled) {
    background: var(--bg-page);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
  :global(.input-plain) {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid var(--border-input);
    border-radius: var(--radius-input);
    font-family: var(--font);
    font-size: 14px;
    color: var(--text-primary);
    background: #fff;
    outline: none;
    transition: border-color 0.15s;
  }
  :global(.input-plain:focus) {
    border-color: var(--orange);
  }
  :global(.input-plain:disabled) {
    background: var(--bg-page);
    color: var(--text-secondary);
    cursor: not-allowed;
  }

  /* ── Error message ── */
  :global(.error-msg) {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: var(--error);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 500;
  }

  /* ── Link naranja ── */
  :global(.link-orange) {
    color: var(--orange);
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }
  :global(.link-orange:hover) {
    text-decoration: underline;
  }

  /* ── Badge de estado ── */
  :global(.badge) {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
  }
  :global(.badge-pendiente)   { background: #FFF7ED; color: #C2410C; }
  :global(.badge-en_revision) { background: #EFF6FF; color: #1D4ED8; }
  :global(.badge-aprobada)    { background: #F0FDF4; color: #15803D; }
  :global(.badge-rechazada)   { background: #FEF2F2; color: #B91C1C; }
</style>

