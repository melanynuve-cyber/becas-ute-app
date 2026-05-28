<script>
  import { onMount } from 'svelte'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import PageHeader from '../../lib/components/ui/PageHeader.svelte'
  import InputField from '../../lib/components/ui/InputField.svelte'

  let personalList = []
  let loading = true
  let error = ''
  let exito = ''

  let nombre = ''
  let email = ''
  let rolSeleccionado = ''
  let guardando = false

  let ultimoCreado = null

  const ROLES_DISPONIBLES = [
    { key: 'coordinador_becas', label: 'Coordinador de Becas' },
    { key: 'coordinador_dual', label: 'Coordinador Dual' },
    { key: 'coordinador_carrera', label: 'Coordinador de Carrera' }
  ]

  onMount(async () => {
    await cargarPersonal()
  })

  async function cargarPersonal() {
    loading = true
    try {
      personalList = await api.auth.listarPersonal() 
    } catch (e) {
      error = `Fallo al cargar directorio: ${e.message}`
    } finally {
      loading = false
    }
  }

  async function registrarPersonal() {
    error = ''
    exito = ''
    ultimoCreado = null
    
    if (!nombre || !email || !rolSeleccionado) {
      error = 'Todos los campos son obligatorios.'
      return
    }

    if (!email.endsWith('@ute.edu.mx')) {
      error = 'El correo debe pertenecer al dominio institucional (@ute.edu.mx).'
      return
    }

    guardando = true
    try {
      const body = {
        nombre: nombre.trim(),
        email: email.trim(),
        roles: {
          admin: rolSeleccionado === 'coordinador_becas',
          alumno: false,
          coordinador_becas: rolSeleccionado === 'coordinador_becas',
          coordinador_dual: rolSeleccionado === 'coordinador_dual',
          coordinador_carrera: rolSeleccionado === 'coordinador_carrera'
        }
      }

      await api.auth.crearUsuarioPersonal(body)

      ultimoCreado = {
        correo: email.trim(),
        clave: 'UTE2026*'
      }

      exito = 'Usuario registrado correctamente.'
      nombre = ''
      email = ''
      rolSeleccionado = ''
      
      await cargarPersonal()
    } catch (e) {
      error = e.message || 'Error al intentar registrar al miembro de personal.'
    } finally {
      guardando = false
    }
  }

  async function darDeBaja(id, nombreUsuario) {
    const confirmado = confirm(`¿Estás seguro de revocar el acceso a ${nombreUsuario || 'este usuario'}? Esta acción no se puede deshacer.`)
    if (!confirmado) return

    error = ''
    exito = ''
    ultimoCreado = null

    try {
      await api.auth.eliminarPersonal(id)
      exito = 'El usuario ha sido dado de baja del sistema.'
      await cargarPersonal()
    } catch (e) {
      error = `No se pudo eliminar: ${e.message}`
    }
  }
</script>

<Navbar />

<main class="main-container">
  <div class="content-wrapper">
    <PageHeader 
      title="Control de Personal Académico" 
      subtitle="Alta y gestión de accesos restringidos para coordinadores y directivos" 
    />

    <div class="split-layout">
      <div class="panel-card">
        <h2 class="panel-section-title">Registrar Nuevo Miembro</h2>
        
        {#if error}
          <div class="error-msg">{error}</div>
        {/if}
        
        {#if exito && ultimoCreado}
          <div class="success-box">
            <p class="success-title">¡Creado con éxito!</p>
            <div class="cred-row">
              <span class="cred-label">Usuario:</span>
              <span class="cred-value">{ultimoCreado.correo}</span>
            </div>
            <div class="cred-row">
              <span class="cred-label">Contraseña:</span>
              <span class="cred-value font-mono">{ultimoCreado.clave}</span>
            </div>
          </div>
        {/if}

        {#if exito && !ultimoCreado}
          <div class="success-msg">{exito}</div>
        {/if}

        <div class="form-layout">
          <InputField 
            id="nombre" 
            label="Nombre Completo" 
            placeholder="Ej. Ing. Juan Pérez" 
            bind:value={nombre} 
            required={false}
          />

          <InputField 
            id="email" 
            type="email"
            label="Correo Institucional" 
            placeholder="usuario@ute.edu.mx" 
            bind:value={email} 
            required={false}
          />

          <div class="input-field-group">
            <label for="rol">Rol del Sistema</label>
            <select id="rol" class="input-plain" bind:value={rolSeleccionado}>
              <option value="">Selecciona una categoría</option>
              {#each ROLES_DISPONIBLES as r}
                <option value={r.key}>{r.label}</option>
              {/each}
            </select>
          </div>

          <button 
            class="btn-primary" 
            on:click={registrarPersonal}
            disabled={guardando || !nombre || !email || !rolSeleccionado}
          >
            {guardando ? 'Registrando...' : 'Dar de Alta'}
          </button>
        </div>
      </div>

      <div class="panel-card">
        <h2 class="panel-section-title">Directorio Activo</h2>
        
        {#if loading}
          <div class="spinner-container">
            <div class="spinner-element"></div>
          </div>
        {:else if personalList.length === 0}
          <p class="empty-state-txt">No hay usuarios de personal registrados en el sistema.</p>
        {:else}
          <div class="table-scroll-area">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo Electrónico</th>
                  <th>Permisos</th>
                  <th style="width: 60px; text-align: center;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {#each personalList as p}
                  {#if p.roles && !p.roles.alumno}
                    <tr>
                      <td class="cell-primary-name">{p.nombre || 'Sin nombre'}</td>
                      <td class="cell-mono-txt">{p.email}</td>
                      <td>
                        {#if p.roles.admin}
                          <span class="role-badge badge-admin">Soporte</span>
                        {/if}
                        {#if p.roles.coordinador_becas}
                          <span class="role-badge badge-becas">Becas</span>
                        {/if}
                        {#if p.roles.coordinador_dual}
                          <span class="role-badge badge-dual">Dual</span>
                        {/if}
                        {#if p.roles.coordinador_carrera}
                          <span class="role-badge badge-carrera">Carrera</span>
                        {/if}
                      </td>
                      <td style="text-align: center;">
                        {#if p.roles.admin}
                          <span class="protected-icon" title="Protegido por el sistema">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                          </span>
                        {:else}
                          <button class="action-btn delete-btn" on:click={() => darDeBaja(p.id, p.nombre)} aria-label="Dar de baja">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                            </svg>
                          </button>
                        {/if}
                      </td>
                    </tr>
                  {/if}
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>

<style>
  .main-container { padding-top: 56px; min-height: 100vh; background: var(--bg-page); }
  .content-wrapper { max-width: 1100px; margin: 0 auto; padding: 40px 24px; display: flex; flex-direction: column; gap: 24px; }
  
  .split-layout { display: grid; grid-template-columns: 380px 1fr; gap: 24px; align-items: start; }
  .panel-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-card); box-shadow: var(--shadow-card); padding: 28px; display: flex; flex-direction: column; gap: 20px; }
  .panel-section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); padding-bottom: 12px; border-bottom: 1px solid var(--border); }
  
  .form-layout { display: flex; flex-direction: column; gap: 16px; }
  .input-field-group { display: flex; flex-direction: column; gap: 6px; }
  .input-field-group label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  
  .table-scroll-area { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-input); }
  .data-table { width: 100%; border-collapse: collapse; font-size: 14px; text-align: left; }
  .data-table th { padding: 12px 16px; background: var(--bg-page); color: var(--text-secondary); font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
  .data-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); color: var(--text-secondary); }
  
  .cell-primary-name { font-weight: 600; color: var(--text-primary); }
  .cell-mono-txt { font-family: monospace; font-size: 13px; }
  
  .role-badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; margin-right: 4px; display: inline-block; }
  .badge-becas { background: #E0F2FE; color: #0369A1; }
  .badge-dual { background: #FFF7ED; color: #C2410C; }
  .badge-carrera { background: #F0FDF4; color: #166534; }
  .badge-admin { background: #F3E8FF; color: #7E22CE; }
  
  .protected-icon { display: inline-flex; padding: 6px; color: var(--text-disabled); }
  
  .action-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: background 0.15s, color 0.15s; display: inline-flex; align-items: center; justify-content: center; }
  .delete-btn { color: var(--text-disabled); }
  .delete-btn:hover { color: var(--error); background: #FEF2F2; }
  
  .empty-state-txt { font-size: 13px; color: var(--text-secondary); font-style: italic; text-align: center; padding: 20px 0; }
  
  .success-box { background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.2); padding: 14px 16px; border-radius: var(--radius-input); display: flex; flex-direction: column; gap: 8px; }
  .success-msg { background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.2); color: var(--success); padding: 10px; border-radius: var(--radius-input); font-size: 13px; font-weight: 500; text-align: center; }
  .success-title { font-size: 14px; font-weight: 700; color: var(--success); margin: 0; }
  .cred-row { display: flex; justify-content: space-between; font-size: 13px; gap: 12px; }
  .cred-label { color: var(--text-secondary); font-weight: 500; }
  .cred-value { color: var(--text-primary); font-weight: 600; word-break: break-all; }
  .font-mono { font-family: monospace; font-size: 13px; letter-spacing: 0.02em; }
  
  .spinner-container { display: flex; justify-content: center; padding: 24px 0; }
  .spinner-element { width: 24px; height: 24px; border: 2px solid var(--border); border-top-color: var(--orange); border-radius: 50%; animation: spin 0.8s linear infinite; }
  
  @keyframes spin { to { transform: rotate(360deg); } }
  
  @media (max-width: 900px) {
    .split-layout { grid-template-columns: 1fr; }
  }
</style>