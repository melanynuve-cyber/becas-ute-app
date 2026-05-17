// src/lib/components/shared/FiltrosBarra.svelte
<script>
  // Importaciones
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  // Props de visibilidad
  export let mostrarEstado = true
  export let mostrarCarrera = true
  export let mostrarGrupo = true

  // Props de filtros
  export let filtroBusqueda = ''
  export let filtroGrupo = ''
  export let filtroCarrera = ''
  export let filtroEstado = ''
  
  // Datos de selectores
  export let grupos = []
  export let carreras = [
    { id: 'TII', nombre: 'Ingeniería en Tecnologías de la Información e Innovación Digital' }
  ]

  // Filtrado reactivo
  $: gruposFiltrados = filtroCarrera
    ? grupos.filter(g => g.toLowerCase().includes(filtroCarrera.toLowerCase()))
    : []

  // Manejo de eventos
  function handleCarreraChange() {
    filtroGrupo = ''
    handleBuscar()
  }

  function handleBuscar() {
    dispatch('buscar')
  }
</script>

<div class="filters-row">
  <input
    type="text"
    class="input-plain input-busqueda"
    placeholder="Buscar por matrícula o nombre…"
    bind:value={filtroBusqueda}
    on:keydown={(e) => e.key === 'Enter' && handleBuscar()}
  />

  {#if mostrarCarrera}
    <select bind:value={filtroCarrera} class="input-plain select-field select-carrera" on:change={handleCarreraChange}>
      <option value="">Todas las carreras</option>
      {#each carreras as car}
        <option value={car.id}>{car.nombre}</option>
      {/each}
    </select>
  {/if}

  {#if mostrarGrupo}
    <select bind:value={filtroGrupo} class="input-plain select-field select-grupo" on:change={handleBuscar} disabled={mostrarCarrera && !filtroCarrera}>
      {#if mostrarCarrera && !filtroCarrera}
        <option value="">Selecciona una carrera primero...</option>
      {:else}
        <option value="">Todos los grupos</option>
        {#each (filtroCarrera ? gruposFiltrados : grupos) as g}
          <option value={g}>{g}</option>
        {/each}
      {/if}
    </select>
  {/if}

  {#if mostrarEstado}
    <select bind:value={filtroEstado} class="input-plain select-field select-estado" on:change={handleBuscar}>
      <option value="">Todos los estados</option>
      <option value="Pendiente">Pendiente</option>
      <option value="En_revision">En revisión</option>
      <option value="Aprobada">Aprobada</option>
      <option value="Rechazada">Rechazada</option>
    </select>
  {/if}

  <button class="btn-outline btn-actualizar" on:click={handleBuscar}>Actualizar</button>
</div>

<style>
  .filters-row {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
    align-items: center;
    background: var(--bg-card);
    padding: 12px 16px;
    border-radius: var(--radius-card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card);
    margin-bottom: 1.5rem;
  }
  .input-plain {
    font-family: var(--font);
    font-size: 14px;
  }
  .input-busqueda { flex: 1.2; min-width: 150px; max-width: 220px; }
  .select-field { flex: 1; min-width: 130px; }
  .select-carrera { max-width: 320px; text-overflow: ellipsis; }
  .select-grupo { max-width: 160px; }
  .select-estado { max-width: 150px; }
  .btn-actualizar { white-space: nowrap; padding: 10px 16px; font-size: 14px; height: 40px; display: flex; align-items: center; }
</style>