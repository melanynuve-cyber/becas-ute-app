<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { api } from "../../lib/services/api.js";
  import { logout } from "../../lib/stores/auth.js";

  // ── ESTADOS DE BANDEJA Y REVISIÓN ──
  let reportes = [];
  let loading = true;
  let error = "";

  let filtroEstado = "Pendiente";
  let filtroCuatrimestre = "";
  let cuatrimestres = [];

  let seleccionado = null;
  let vista = "bandeja"; // 'bandeja' | 'revision' | 'empresas'

  let accion = "";
  let nota = "";
  let enviando = false;
  let exito = "";
  let errorAccion = "";

  let sidebarOpen = false;

  // ── ESTADOS DE EMPRESAS ──
  let empresas = []
  let loadingEmpresas = false
  let nuevaEmpresa = ''
  let empresaSeleccionada = ''
  let matriculaBusqueda = ''
  let alumnoPreview = null
  let loadingPreview = false
  let errorAsignacion = ''
  let exitoAsignacion = ''
  let guardandoAsignacion = false

  async function cargarEmpresas() {
    loadingEmpresas = true
    try {
      empresas = await api.dual.listarEmpresas()
    } catch(e) {
      console.error(e)
    } finally {
      loadingEmpresas = false
    }
  }

  async function buscarAlumno() {
    if (!matriculaBusqueda.trim()) return
    loadingPreview = true
    alumnoPreview = null
    errorAsignacion = ''
    try {
      alumnoPreview = await api.dual.buscarAlumno(matriculaBusqueda.trim())
      empresaSeleccionada = alumnoPreview.empresa_id || ''
    } catch(e) {
      errorAsignacion = 'Alumno no encontrado'
    } finally {
      loadingPreview = false
    }
  }

  async function crearEmpresa() {
    if (!nuevaEmpresa.trim()) return
    try {
      const emp = await api.dual.crearEmpresa({ nombre: nuevaEmpresa.trim() })
      empresas = [...empresas, emp]
      empresaSeleccionada = emp.id
      nuevaEmpresa = ''
    } catch(e) {
      errorAsignacion = e.message
    }
  }

  async function guardarAsignacion() {
    errorAsignacion = ''
    exitoAsignacion = ''
    if (!alumnoPreview) { errorAsignacion = 'Busca un alumno primero'; return }
    if (!empresaSeleccionada) { errorAsignacion = 'Selecciona una empresa'; return }
    guardandoAsignacion = true
    try {
      await api.dual.actualizarAlumnoDual(alumnoPreview.matricula, {
        alumno_dual: true,
        empresa_id: empresaSeleccionada  // UUID — sin parseInt
      })
      exitoAsignacion = 'Alumno dual actualizado correctamente'
      alumnoPreview = {
        ...alumnoPreview,
        es_alumno_dual: true,
        empresa_id: empresaSeleccionada,
        empresa: empresas.find(e => e.id === empresaSeleccionada)?.nombre
      }
    } catch(e) {
      errorAsignacion = e.message
    } finally {
      guardandoAsignacion = false
    }
  }

  async function quitarDual() {
    if (!alumnoPreview) return
    guardandoAsignacion = true
    errorAsignacion = ''
    exitoAsignacion = ''
    try {
      await api.dual.actualizarAlumnoDual(alumnoPreview.matricula, { alumno_dual: false })
      exitoAsignacion = 'Rol dual removido correctamente'
      alumnoPreview = { ...alumnoPreview, es_alumno_dual: false, activo: false }
    } catch(e) {
      errorAsignacion = e.message
    } finally {
      guardandoAsignacion = false
    }
  }

  // ── FUNCIONES DE BANDEJA ──
  async function cargarReportes() {
    loading = true;
    error = "";
    try {
      const params = new URLSearchParams();
      if (filtroEstado) params.append("estado", filtroEstado);
      if (filtroCuatrimestre) params.append("cuatrimestre", filtroCuatrimestre);
      const data = await api.dual.listarReportes(params.toString());
      reportes = data;
      const set = new Set(data.map((r) => r.cuatrimestre));
      cuatrimestres = [...set].sort().reverse();
    } catch (e) {
      error = e.message || "Error al cargar reportes.";
    } finally {
      loading = false;
    }
  }

  function abrirRevision(reporte) {
    seleccionado = reporte;
    accion = "";
    nota = "";
    exito = "";
    errorAccion = "";
    vista = "revision";
  }

  function volverBandeja() {
    seleccionado = null;
    vista = "bandeja";
    cargarReportes();
  }

  async function enviarDecision() {
    if (!accion) { errorAccion = "Selecciona una acción."; return; }
    if (accion === "rechazar" && !nota.trim()) {
      errorAccion = "Escribe una nota al rechazar.";
      return;
    }
    enviando = true;
    errorAccion = "";
    exito = "";
    try {
      const body = { estado: accion === "aprobar" ? "Aprobada" : "Rechazada" };
      if (nota.trim()) body.nota_agente = nota.trim();
      await api.dual.revisarReporte(seleccionado.id, body);
      exito = accion === "aprobar"
        ? "Reporte aprobado correctamente."
        : "Reporte rechazado. El alumno podrá reenviar.";
      seleccionado = {
        ...seleccionado,
        estado: accion === "aprobar" ? "Aprobada" : "Rechazada",
        nota_agente: nota.trim() || seleccionado.nota_agente,
      };
    } catch (e) {
      errorAccion = e.message || "Error al enviar la decisión.";
    } finally {
      enviando = false;
    }
  }

  //FUNCIONES DE EMPRESAS
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function badgeClass(estado) {
    const map = {
      Pendiente: "badge badge-pendiente",
      Aprobada:  "badge badge-aprobada",
      Rechazada: "badge badge-rechazada",
    };
    return map[estado] || "badge";
  }

  function formatFecha(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-MX", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  onMount(cargarReportes)
</script>

<!-- NAVBAR -->
<header class="navbar">
  <button class="hamburger" on:click={() => sidebarOpen = true} aria-label="Menú">
    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/>
    </svg>
  </button>
  <div class="brand">
    <img src="/UTEG-01.png" alt="UTE" class="logo-ute" />
  </div>
  <div style="width:32px;"></div>
</header>

{#if sidebarOpen}
  <button class="overlay" on:click={() => sidebarOpen = false}
    on:keydown={(e) => e.key === "Escape" && (sidebarOpen = false)}
    aria-label="Cerrar menú">
  </button>
{/if}

<aside class="sidebar" class:open={sidebarOpen}>
  <div class="sidebar-header">
    <img src="/UTEG-01.png" alt="UTE" class="logo-ute" />
  </div>
  <nav class="sidebar-nav">
    <p class="nav-section-label">Módulo Dual</p>
    
    <button class="nav-item" class:nav-item-active={vista === 'bandeja' || vista === 'revision'} on:click={() => { vista = 'bandeja'; sidebarOpen = false; cargarReportes(); }}>
      <span class="nav-icon">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/>
        </svg>
      </span>
      Bandeja de reportes
    </button>

    <button class="nav-item" class:nav-item-active={vista === 'empresas'} 
      on:click={() => { vista = 'empresas'; cargarEmpresas(); sidebarOpen = false }}>
      <span class="nav-icon">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
        </svg>
      </span>
      Empresas y asignaciones
    </button>
  </nav>
  <div class="sidebar-footer">
    <button class="logout-btn" on:click={handleLogout}>
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
      </svg>
      Cerrar Sesión
    </button>
  </div>
</aside>

<!-- CONTENIDO -->
<div class="main-content">

<!-- ══════════════════════ BANDEJA ══════════════════════════════════ -->
{#if vista === "bandeja"}
  <div class="page-wrap">
    <div class="page-header">
      <h1 class="page-title">Bandeja de reportes duales</h1>
      <p class="page-sub">Revisión semanal de entregas de alumnos DUAL</p>
    </div>

    <div class="filters-row">
      <div class="input-wrap" style="min-width:160px;">
        <select bind:value={filtroEstado} on:change={cargarReportes} class="input-plain">
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobada">Aprobada</option>
          <option value="Rechazada">Rechazada</option>
        </select>
      </div>
      <div class="input-wrap" style="min-width:180px;">
        <select bind:value={filtroCuatrimestre} on:change={cargarReportes} class="input-plain">
          <option value="">Todos los cuatrimestres</option>
          {#each cuatrimestres as c}
            <option value={c}>{c}</option>
          {/each}
        </select>
      </div>
      <button class="btn-outline" on:click={cargarReportes}>Actualizar</button>
    </div>

    {#if loading}
      <div class="state-msg">Cargando reportes…</div>
    {:else if error}
      <p class="error-msg">{error}</p>
    {:else if reportes.length === 0}
      <div class="state-msg empty">
        <span class="empty-icon">📭</span>
        <p>No hay reportes con los filtros seleccionados.</p>
      </div>
    {:else}
      <div class="table-wrap">
        <table class="reporte-table">
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Nombre</th>
              <th>Calificación</th>
              <th>Estado</th>
              <th>Entregado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each reportes as r}
              <tr class:row-pendiente={r.estado === "Pendiente"}>
                <td class="td-matricula">{r.matricula}</td>
                <td class="td-nombre">{r.nombre || "—"}</td>
                <td class="td-cal">{r.calificacion_alumno}</td>
                <td><span class={badgeClass(r.estado)}>{r.estado}</span></td>
                <td class="td-fecha">{formatFecha(r.created_at)}</td>
                <td>
                  <button class="btn-revisar" on:click={() => abrirRevision(r)}>
                    {r.estado === "Pendiente" ? "Revisar →" : "Ver →"}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <p class="count-label">{reportes.length} reporte{reportes.length !== 1 ? "s" : ""}</p>
    {/if}
  </div>

<!-- ══════════════════════ REVISIÓN ═════════════════════════════════ -->
{:else if vista === "revision" && seleccionado}
  <div class="revision-wrap">
    <div class="revision-topbar">
      <button class="btn-back" on:click={volverBandeja}>← Volver a bandeja</button>
      <span class={badgeClass(seleccionado.estado)}>{seleccionado.estado}</span>
    </div>

    <div class="split-layout">
      <!-- PDF -->
      <div class="panel-pdf">
        <div class="panel-label">Reporte entregado</div>
        {#if seleccionado.archivo_pdf_url}
          <iframe src={seleccionado.archivo_pdf_url} title="Reporte PDF" class="pdf-iframe"></iframe>
          <a href={seleccionado.archivo_pdf_url} target="_blank" rel="noopener noreferrer" class="link-externo">
            Abrir en nueva pestaña ↗
          </a>
        {:else}
          <div class="no-pdf">No hay PDF disponible.</div>
        {/if}
      </div>

      <!-- Panel derecho -->
      <div class="panel-acciones">
        <div class="panel-label">Decisión del agente</div>
        <div class="dato-cal">
          <p class="dato-label">Calificación declarada</p>
          <p class="dato-valor">{seleccionado.calificacion_alumno}</p>
        </div>

        <div class="ficha-alumno">
          <p class="ficha-titulo">Datos del alumno</p>
          <div class="ficha-grid">
            <span class="ficha-key">Nombre</span>
            <span class="ficha-val">{seleccionado.nombre || "—"}</span>

            <span class="ficha-key">Matrícula</span>
            <span class="ficha-val ficha-mono">{seleccionado.matricula}</span>

            <span class="ficha-key">Carrera</span>
            <span class="ficha-val">{seleccionado.carrera || "—"}</span>

            <span class="ficha-key">Empresa</span>
            <span class="ficha-val">{seleccionado.empresa || 'Sin asignar'}</span>

            <span class="ficha-key">Grupo</span>
            <span class="ficha-val">{seleccionado.nomenclatura || seleccionado.cuatrimestre || "—"}</span>

            <span class="ficha-key">Semana</span>
            <span class="ficha-val">Semana {seleccionado.semana}</span>

            <span class="ficha-key">Entregado</span>
            <span class="ficha-val">{formatFecha(seleccionado.created_at)}</span>
          </div>
        </div>

        {#if seleccionado.nota_agente}
          <div class="nota-previa">
            <p class="dato-label">Nota del agente</p>
            <p class="nota-texto">{seleccionado.nota_agente}</p>
          </div>
        {/if}

        {#if seleccionado.estado === "Pendiente"}
          <div class="acciones-grupo">
            <div class="btn-decision-row">
              <button class="btn-decision btn-aprobar" class:activo={accion === "aprobar"} on:click={() => { accion = "aprobar"; nota = ""; }}>✅ Aprobar</button>
              <button class="btn-decision btn-rechazar" class:activo={accion === "rechazar"} on:click={() => (accion = "rechazar")}>❌ Rechazar</button>
            </div>

            {#if accion === "rechazar" || accion === "aprobar"}
              <div class="input-wrap" style="margin-top:12px;">
                <textarea class="input-plain textarea-nota" placeholder={accion === "rechazar" ? "Razón del rechazo (obligatorio)…" : "Nota opcional para el alumno…"} rows="3" bind:value={nota}></textarea>
              </div>
            {/if}

            {#if errorAccion}<p class="error-msg" style="margin-top:10px;">{errorAccion}</p>{/if}
            {#if exito}<p class="exito-msg">{exito}</p>{/if}

            {#if !exito}
              <button class="btn-primary" style="width:100%; margin-top:14px;" on:click={enviarDecision} disabled={enviando || !accion}>
                {enviando ? "Enviando…" : "Confirmar decisión"}
              </button>
            {:else}
              <button class="btn-outline" style="width:100%; margin-top:10px;" on:click={volverBandeja}>← Volver a la bandeja</button>
            {/if}
          </div>
        {:else}
          <div class="ya-revisado">
            <p>Este reporte ya fue <strong class:text-verde={seleccionado.estado === "Aprobada"} class:text-rojo={seleccionado.estado === "Rechazada"}>{seleccionado.estado.toLowerCase()}</strong>.</p>
            <button class="btn-outline" style="margin-top:12px; width:100%;" on:click={volverBandeja}>← Volver a la bandeja</button>
          </div>
        {/if}
      </div>
    </div>
  </div>

<!-- ══════════════════════ EMPRESAS ═════════════════════════════════ -->
{:else if vista === 'empresas'}
<div class="page-wrap">
  <div class="page-header">
    <h1 class="page-title">Gestión de alumnos duales</h1>
    <p class="page-sub">Asigna empresas y roles a alumnos duales</p>
  </div>

  {#if loadingEmpresas}
    <div class="state-msg">Cargando...</div>
  {:else}
    <div class="empresas-layout">

      <div class="card-seccion">
        <h2 class="seccion-title">Buscar alumno</h2>

        {#if errorAsignacion}<div class="error-msg">{errorAsignacion}</div>{/if}
        {#if exitoAsignacion}<div class="exito-msg">{exitoAsignacion}</div>{/if}

        <div class="nueva-empresa-row">
          <input class="input-plain" placeholder="Matrícula del alumno"
            bind:value={matriculaBusqueda}
            on:keydown={(e) => e.key === 'Enter' && buscarAlumno()} />
          <button class="btn-outline" style="white-space:nowrap"
            on:click={buscarAlumno} disabled={loadingPreview}>
            {loadingPreview ? '...' : 'Buscar'}
          </button>
        </div>

        {#if alumnoPreview}
          <div class="ficha-alumno" style="margin:0">
            <p class="ficha-titulo">Datos del alumno</p>
            <div class="ficha-grid">
              <span class="ficha-key">Nombre</span>
              <span class="ficha-val">{alumnoPreview.nombre}</span>
              <span class="ficha-key">Carrera</span>
              <span class="ficha-val">{alumnoPreview.carrera || '—'}</span>
              <span class="ficha-key">Grupo</span>
              <span class="ficha-val">{alumnoPreview.nomenclatura || '—'}</span>
              <span class="ficha-key">Es dual</span>
              <span class="ficha-val">{alumnoPreview.es_alumno_dual ? '✅ Sí' : '❌ No'}</span>
              <span class="ficha-key">Empresa</span>
              <span class="ficha-val">{alumnoPreview.empresa || 'Sin asignar'}</span>
            </div>
          </div>

          <div class="field">
            <label>Empresa</label>
            <select class="input-plain" bind:value={empresaSeleccionada}>
              <option value="">Selecciona una empresa</option>
              {#each empresas as e}
                <option value={e.id}>{e.nombre}</option>
              {/each}
            </select>
          </div>

          <div class="nueva-empresa-row">
            <input class="input-plain" placeholder="O escribe una empresa nueva..."
              bind:value={nuevaEmpresa}
              on:keydown={(e) => e.key === 'Enter' && crearEmpresa()} />
            <button class="btn-outline" style="white-space:nowrap"
              on:click={crearEmpresa} disabled={!nuevaEmpresa.trim()}>
              + Agregar
            </button>
          </div>

          <div style="display:flex;gap:8px;margin-top:4px">
            <button class="btn-primary" style="flex:1"
              on:click={guardarAsignacion} disabled={guardandoAsignacion || !empresaSeleccionada}>
              {guardandoAsignacion ? 'Guardando...' : alumnoPreview.es_alumno_dual ? 'Actualizar empresa' : 'Activar como dual'}
            </button>
            {#if alumnoPreview.es_alumno_dual}
              <button class="btn-outline" style="flex:1;color:#B91C1C;border-color:#FECACA"
                on:click={quitarDual} disabled={guardandoAsignacion}>
                Quitar dual
              </button>
            {/if}
          </div>
        {/if}
      </div>

      <div class="card-seccion">
        <h2 class="seccion-title">Empresas registradas</h2>
        {#if empresas.length === 0}
          <p class="empty-msg">No hay empresas registradas aún.</p>
        {:else}
          <ul class="empresa-list">
            {#each empresas as e}
              <li class="empresa-item">
                <span class="empresa-nombre">{e.nombre}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

    </div>
  {/if}
</div>
{/if}

</div>

<style>
  /* ── Estilos de tu componente original ─────────────────────── */
  .navbar {
    position: fixed; top: 0; left: 0; right: 0; height: 56px;
    background: var(--bg-card); border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 16px; z-index: 100;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
  .hamburger {
    background: none; border: none; cursor: pointer;
    padding: 6px; border-radius: 8px; color: var(--text-primary);
    transition: background 0.15s;
  }
  .hamburger:hover { background: var(--bg-page); }
  .brand { display: flex; align-items: center; }
  .logo-ute { height: 44px; width: auto; object-fit: contain; }
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.3);
    z-index: 200; backdrop-filter: blur(2px);
    border: none; width: 100%; cursor: default;
  }
  .sidebar {
    position: fixed; top: 0; left: 0; bottom: 0; width: 260px;
    background: var(--bg-card); z-index: 300;
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
  .nav-section-label {
    font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--text-secondary);
    padding: 4px 14px 8px; margin: 0;
  }
  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 10px;
    font-family: var(--font); font-size: 14px; font-weight: 500;
    color: var(--text-primary); background: none; border: none;
    cursor: pointer; text-align: left; width: 100%;
    transition: background 0.15s, color 0.15s;
  }
  .nav-item:hover { background: var(--orange-light); color: var(--orange); }
  .nav-item-active { background: var(--orange-light); color: var(--orange); }
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

  .main-content { padding-top: 56px; }
  .page-wrap { padding: 2rem 1.5rem; max-width: 900px; margin: 0 auto; }
  .page-header { margin-bottom: 1.5rem; }
  .page-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
  .page-sub { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }

  .filters-row {
    display: flex; gap: 12px; flex-wrap: wrap;
    align-items: center; margin-bottom: 1.5rem;
  }
  .table-wrap {
    overflow-x: auto; border: 1px solid var(--border);
    border-radius: var(--radius-card); background: var(--bg-card);
  }
  .reporte-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  .reporte-table thead { background: #F9FAFB; }
  .reporte-table th {
    text-align: left; padding: 10px 16px; font-weight: 600;
    color: var(--text-secondary); font-size: 0.78rem;
    text-transform: uppercase; letter-spacing: 0.05em;
    border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  .reporte-table td {
    padding: 13px 16px; color: var(--text-primary);
    border-bottom: 1px solid var(--border);
  }
  .reporte-table tbody tr:last-child td { border-bottom: none; }
  .reporte-table tbody tr:hover { background: #FFFBF7; }
  .row-pendiente { border-left: 3px solid var(--orange); }

  .td-matricula { font-family: monospace; font-weight: 600; letter-spacing: 0.03em; white-space: nowrap; }
  .td-nombre { font-weight: 500; }
  .td-cal { font-weight: 700; color: var(--orange); font-size: 1rem; }
  .td-fecha { color: var(--text-secondary); font-size: 0.82rem; white-space: nowrap; }

  .btn-revisar {
    background: none; border: 1px solid var(--border); border-radius: 8px;
    padding: 5px 14px; font-size: 0.82rem; font-weight: 600;
    color: var(--orange); cursor: pointer; white-space: nowrap;
    transition: background 0.15s, border-color 0.15s;
  }
  .btn-revisar:hover { background: var(--orange-light); border-color: var(--orange); }
  .count-label { font-size: 0.8rem; color: var(--text-secondary); margin: 10px 0 0; text-align: right; }
  .state-msg { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); font-size: 0.9rem; }
  .empty { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .empty-icon { font-size: 2rem; }

  .revision-wrap { display: flex; flex-direction: column; height: calc(100vh - 56px); overflow: hidden; }
  .revision-topbar {
    display: flex; align-items: center; gap: 12px; padding: 10px 20px;
    background: var(--bg-card); border-bottom: 1px solid var(--border);
  }
  .btn-back {
    background: none; border: none; cursor: pointer;
    font-size: 0.875rem; font-weight: 600;
    color: var(--orange); padding: 0;
  }
  .btn-back:hover { text-decoration: underline; }
  .split-layout { display: grid; grid-template-columns: 1fr 340px; flex: 1; overflow: hidden; }

  .panel-pdf { display: flex; flex-direction: column; border-right: 1px solid var(--border); overflow: hidden; }
  .panel-label {
    font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.07em; color: var(--text-secondary);
    padding: 9px 16px; border-bottom: 1px solid var(--border); background: #F9FAFB;
  }
  .pdf-iframe { flex: 1; width: 100%; border: none; background: #fff; }
  .link-externo {
    display: block; padding: 7px 16px; font-size: 0.78rem;
    color: var(--orange); text-decoration: none;
    border-top: 1px solid var(--border); background: var(--bg-card);
  }
  .link-externo:hover { text-decoration: underline; }
  .no-pdf { display: flex; align-items: center; justify-content: center; flex: 1; color: var(--text-secondary); font-size: 0.875rem; }

  .panel-acciones { display: flex; flex-direction: column; overflow-y: auto; background: var(--bg-card); }
  .panel-acciones .panel-label { background: #F9FAFB; }
  .dato-cal { margin: 16px 16px 0; padding: 14px 16px; background: var(--orange-light); border: 1px solid #FED7AA; border-radius: 10px; }
  .dato-label { font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.05em; }
  .dato-valor { font-size: 2.25rem; font-weight: 800; color: var(--orange); margin: 0; line-height: 1; }
  
  .ficha-alumno { margin: 12px 16px 0; padding: 14px 16px; border: 1px solid var(--border); border-radius: 10px; background: #F9FAFB; }
  .ficha-titulo { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin: 0 0 10px; }
  .ficha-grid { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; align-items: baseline; }
  .ficha-key { font-size: 0.78rem; color: var(--text-secondary); white-space: nowrap; }
  .ficha-val { font-size: 0.85rem; font-weight: 500; color: var(--text-primary); }
  .ficha-mono { font-family: monospace; letter-spacing: 0.03em; }

  .nota-previa { margin: 12px 16px 0; padding: 12px 14px; background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 10px; }
  .nota-texto { font-size: 0.85rem; color: var(--text-primary); margin: 4px 0 0; line-height: 1.5; }

  .acciones-grupo { padding: 14px 16px 20px; }
  .btn-decision-row { display: flex; gap: 8px; }
  .btn-decision {
    flex: 1; padding: 11px 8px; border-radius: 10px; font-size: 0.875rem; font-weight: 600; cursor: pointer;
    transition: all 0.15s; border: 2px solid transparent; text-align: center;
  }
  .btn-aprobar { background: #F0FDF4; color: #15803D; border-color: #BBF7D0; }
  .btn-aprobar:hover, .btn-aprobar.activo { background: #DCFCE7; border-color: #4ADE80; }
  .btn-rechazar { background: #FEF2F2; color: #B91C1C; border-color: #FECACA; }
  .btn-rechazar:hover, .btn-rechazar.activo { background: #FEE2E2; border-color: #F87171; }
  .textarea-nota { width: 100%; min-height: 80px; resize: vertical; box-sizing: border-box; }
  
  .error-msg { color: #B91C1C; font-size: 0.85rem; margin: 4px 0; }
  .exito-msg {
    color: #15803D; background: #F0FDF4; border: 1px solid #BBF7D0;
    border-radius: 8px; padding: 10px 14px; font-size: 0.875rem; margin-top: 12px;
  }
  .ya-revisado { padding: 16px; font-size: 0.9rem; color: var(--text-secondary); }
  .text-verde { color: #15803D; }
  .text-rojo  { color: #B91C1C; }

  /* Elementos de formulario genéricos */
  .input-plain {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--border, #E5E7EB); border-radius: 8px;
    font-size: 0.875rem; font-family: var(--font, inherit);
    background: #fff; box-sizing: border-box; transition: border-color 0.15s;
  }
  .input-plain:focus { outline: none; border-color: var(--orange, #EA580C); }
  .btn-outline {
    background: transparent; border: 1px solid var(--border, #E5E7EB); border-radius: 8px;
    padding: 10px 16px; font-size: 0.875rem; font-weight: 600; color: var(--text-primary, #111827);
    cursor: pointer; transition: all 0.15s;
  }
  .btn-outline:hover:not(:disabled) { background: #F9FAFB; border-color: #D1D5DB; }
  .btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary {
    background: var(--orange, #EA580C); border: none; border-radius: 8px;
    padding: 11px 16px; font-size: 0.875rem; font-weight: 600; color: #fff; cursor: pointer; transition: background 0.15s;
  }
  .btn-primary:hover:not(:disabled) { background: #C2410C; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── TUS ESTILOS NUEVOS DE EMPRESAS EXACTOS ── */
  .empresas-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 8px; }
  .card-seccion {
    background: var(--bg-card); border-radius: var(--radius-card, 12px);
    box-shadow: var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05)); padding: 24px 28px;
    display: flex; flex-direction: column; gap: 14px; border: 1px solid var(--border, #E5E7EB);
  }
  .seccion-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .nueva-empresa-row { display: flex; gap: 8px; align-items: center; }
  .empresa-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; max-height: 400px; }
  .empresa-item {
    padding: 10px 14px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--bg-page, #F9FAFB);
  }
  .empresa-nombre { font-size: 14px; font-weight: 500; color: var(--text-primary); }
  .empty-msg { font-size: 0.9rem; color: var(--text-secondary); margin: 0; }
  
  @media (max-width: 640px) {
    .empresas-layout { grid-template-columns: 1fr; }
  }
</style>
