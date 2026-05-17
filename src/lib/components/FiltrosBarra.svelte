<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  // Props opcionales para ocultar/mostrar selects según la bandeja
  export let mostrarEstado = true
  export let mostrarCarrera = true
  export let mostrarGrupo = true

  export let filtroBusqueda = ''
  export let filtroCuatrimestre = ''
  export let filtroGrupo = ''
  export let filtroCarrera = ''
  export let filtroEstado = ''
  
  export let grupos = []
  export let carreras = ["TII"] // Puedes expandirlo en el futuro

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

  <input
    type="number"
    class="input-plain input-num"
    placeholder="Cuatrimestre"
    bind:value={filtroCuatrimestre}
    min="1" max="12"
    on:keydown={(e) => e.key === 'Enter' && handleBuscar()}
  />

  {#if mostrarGrupo}
    <select bind:value={filtroGrupo} class="input-plain select-field" on:change={handleBuscar}>
      <option value="">Todos los grupos</option>
      {#each grupos as g}
        <option value={g}>{g}</option>
      {/each}
    </select>
  {/if}

  {#if mostrarCarrera}
    <select bind:value={filtroCarrera} class="input-plain select-field" on:change={handleBuscar}>
      <option value="">Todas las carreras</option>
      {#each carreras as car}
        <option value={car}>{car}</option>
      {/each}
    </select>
  {/if}

  {#if mostrarEstado}
    <select bind:value={filtroEstado} class="input-plain select-field" on:change={handleBuscar}>
      <option value="">Todos los estados</option>
      <option value="Pendiente">Pendiente</option>
      <option value="Aprobada">Aprobada</option>
      <option value="Rechazada">Rechazada</option>
    </select>
  {/if}

  <button class="btn-outline" on:click={handleBuscar}>Actualizar</button>
</div>

<style>
  .filters-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
    background: var(--bg-card);
    padding: 16px;
    border-radius: var(--radius-card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card);
    margin-bottom: 1.5rem;
  }
  .input-busqueda { flex: 2; min-width: 200px; }
  .input-num { flex: 0.5; min-width: 110px; }
  .select-field { flex: 1; min-width: 150px; }
</style>