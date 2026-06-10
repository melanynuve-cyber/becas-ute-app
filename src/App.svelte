<script>
  // src/App.svelte
  // Importaciones
  import { onMount } from 'svelte'
  import { Router, Route, navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import {
    isAuthenticated,
    isCoordinadorBecas,
    isAlumnoDual,
    isCoordinadorDual,
    isCoordinadorCarrera,
  } from './lib/stores/auth.js'

  import Login              from './routes/Login.svelte'
  import Register           from './routes/Register.svelte'
  import Verificar          from './routes/Verificar.svelte'
  import CambiarPassword    from './routes/CambiarPassword.svelte'
  import Dashboard          from './routes/dashboard/Dashboard.svelte'
  import NuevaSolicitud     from './routes/solicitud/NuevaSolicitud.svelte'
  import DetalleSolicitud   from './routes/solicitud/DetalleSolicitud.svelte'
  import AdminSolicitudes   from './routes/admin/AdminSolicitudes.svelte'
  import AdminDetalle       from './routes/admin/AdminDetalle.svelte'
  import GestionUsuarios    from './routes/admin/GestionUsuarios.svelte'
  import ConvocatoriaBecas  from './routes/admin/ConvocatoriaBecas.svelte'
  import ReportesDual       from './routes/dual/ReportesDual.svelte'
  import CoordinadorDual    from './routes/dual/CoordinadorDual.svelte'
  import CoordinadorCarrera from './routes/dual/CoordinadorCarrera.svelte'
  import Foro              from './routes/Foro.svelte'
  import NotFound           from './routes/NotFound.svelte'

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
    if (get(isCoordinadorBecas)) {
      return navigate('/admin/solicitudes', { replace: true })
    }
    if (get(isCoordinadorDual)) {
      return navigate('/dual/coordinador',  { replace: true })
    }
    if (get(isCoordinadorCarrera)) {
      return navigate('/dual/carrera',      { replace: true })
    }
    navigate('/foro', { replace: true })
  }
</script>

<Router url={window.location.pathname}>
  <Route path="/login" component={Login} />
  <Route path="/register" component={Register} />
  <Route path="/verificar" component={Verificar} />
  <Route path="/cambiar-password" component={CambiarPassword} />

  <Route path="/foro" component={Foro} />
  <Route path="/dashboard" component={Dashboard} />
  <Route path="/solicitud/nueva" component={NuevaSolicitud} />
  <Route path="/solicitud/:id" component={DetalleSolicitud} />

  <Route path="/dual/reportes" component={ReportesDual} />
  <Route path="/dual/coordinador" component={CoordinadorDual} />
  <Route path="/dual/carrera" component={CoordinadorCarrera} />

  <Route path="/admin/solicitudes" component={AdminSolicitudes} />
  <Route path="/admin/solicitudes/:id" component={AdminDetalle} />
  <Route path="/admin/usuarios" component={GestionUsuarios} />
  <Route path="/admin/convocatoria" component={ConvocatoriaBecas} />

  <!-- Catch-all: 404 para cualquier ruta no definida -->
  <Route component={NotFound} />
</Router>