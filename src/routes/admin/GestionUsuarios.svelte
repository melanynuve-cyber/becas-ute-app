<script>
  // src/routes/admin/GestionUsuarios.svelte
  import { onMount } from 'svelte'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'

  // Estados de control
  let personalList = []
  let loading = true
  let error = ''
  let exito = ''

  // Variables del formulario de alta
  let nombre = ''
  let email = ''
  let rolSeleccionado = ''
  let guardando = false

  // Catálogo de roles internos del sistema
  const ROLES_DISPONIBLES = [
    { key: 'coordinador_becas', label: 'Coordinador de Becas (Admin)' },
    { key: 'coordinador_dual', label: 'Coordinador Dual' },
    { key: 'coordinador_carrera', label: 'Coordinador de Carrera' }
  ]

  onMount(async () => {
    await cargarPersonal()
  })

  async function cargarPersonal() {
    loading = true
    try {
      personalList = await api.admin.listarPersonal()
    } catch (e) {
      error = 'No se pudo cargar el directorio de personal.'
    } finally {
      loading = false
    }
  }

  async function registrarPersonal() {
    error = ''
    exito = ''
    if (!nombre || !email || !rolSeleccionado) {
      error = 'Todos los campos son obligatorios.'
      return
    }

    guardando = true
    try {
      // Construcción dinámica del payload de roles
      const rolesPayload = {
        admin: rolSeleccionado === 'coordinador_becas',
        coordinador_becas: rolSeleccionado === 'coordinador_becas',
        coordinador_dual: rolSeleccionado === 'coordinador_dual',
        coordinador_carrera: rolSeleccionado === 'coordinador_carrera'
      }

      await api.admin.crearUsuarioPersonal({
        nombre: nombre.trim(),
        email: email.trim(),
        roles: rolesPayload
      })

      exito = 'Usuario creado. Se envió un correo para generar su contraseña.'
      nombre = ''
      email = ''
      rolSeleccionado = ''
      await cargarPersonal()
    } catch (e) {
      error = e.message || 'Error al registrar al usuario.'
    } finally {
      guardando = false
    }
  }
</script>

<Navbar />

<main class="main">
  <div class="content">
    <div class="page-header">
      <h1 class="page-title">Control de Personal Académico</h1>
      <p class="page-sub">Alta y gestión de accesos para coordinadores y directivos</p>
    </div>

    <div class="split-layout">
      <div class="card">
        <h2 class="section-title">Registrar Nuevo Miembro</h2>
        
        {#if error}
          <div class="error-msg">{error}</div>
        {/if}
        {#if exito}
          <div class="success-msg">{exito}</div>
        {/if}

        <div class="form-group">
          <div class="field">
            <label for="nombre">Nombre Completo</label>
            <input 
              id="nombre"
              type="text"
              class="input-plain"
              placeholder="Ej. Ing. Juan Pérez"
              bind:value={nombre}
            />
          </div>

          <div class="field">
            <label for="email">Correo Institucional</label>
            <input 
              id="email"
              type="email"
              class="input-plain"
              placeholder="usuario@ute.edu.mx"
              bind:value={email}
            />
          </div>

          <div class="field">
            <label for="rol">Rol Asignado</label>
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
            {guardando ? 'Guardando...' : 'Dar de Alta'}
          </button>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">Directorio Activo</h2>
        
        {#if loading}
          <div class="loading-wrap"><div class="spinner-lg"></div></div>
        {:else if personalList.length === 0}
          <p class="empty-msg">No hay personal administrativo registrado.</p>
        {:else}
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Permisos</th>
                </tr>
              </thead>
              <tbody>
                {#each personalList as p}
                  <tr>
                    <td class="td-nombre">{p.nombre}</td>
                    <td>{p.email}</td>
                    <td>
                      {#if p.roles?.coordinador_becas}
                        <span class="badge badge-admin">Becas</span>
                      {/if}
                      {#if p.roles?.coordinador_dual}
                        <span class="badge badge-dual">Dual</span>
                      {/if}
                      {#if p.roles?.coordinador_carrera}
                        <span class="badge badge-carrera">Carrera</span>
                      {/if}
                    </td>
                  </tr>
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
  .main {
    padding-top: 56px;
    min-height: 100vh;
    background: var(--bg-page);
  }

  .content {
    max-width: 1100px;
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

  .page-sub {
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .split-layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 24px;
    align-items: start;
  }

  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-primary);
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  .table th {
    padding: 12px 16px;
    background: var(--bg-page);
    color: var(--text-disabled);
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--border);
  }

  .table td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    color: var(--text-secondary);
  }

  .td-nombre {
    font-weight: 600;
    color: var(--text-primary);
  }

  .badge {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
  }

  .badge-admin { background: #E0F2FE; color: #0369A1; }
  .badge-dual { background: #FFF7ED; color: #C2410C; }
  .badge-carrera { background: #F0FDF4; color: #166534; }

  .empty-msg {
    font-size: 13px;
    color: var(--text-disabled);
    font-style: italic;
    text-align: center;
  }

  .success-msg {
    background: rgba(34, 197, 94, 0.08);
    border: 1px solid rgba(34, 197, 94, 0.2);
    color: var(--success);
    padding: 10px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    text-align: center;
  }

  @media (max-width: 900px) {
    .split-layout {
      grid-template-columns: 1fr;
    }
  }
</style>