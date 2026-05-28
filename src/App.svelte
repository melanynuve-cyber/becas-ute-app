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