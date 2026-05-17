// src/lib/components/form/StepDatosPersonales.svelte
<script>
  // Exportaciones
  export let datos
  export let fechaFormato
</script>

<section>
  <div class="section-header">
    <span class="section-num">1.</span>
    <h2 class="section-title">Datos Personales</h2>
  </div>
  <div class="divider-orange"></div>

  <div class="row-3">
    <div class="field">
      <label for="fecha">Fecha <span class="req">*</span></label>
      <input id="fecha" class="input-plain" value={fechaFormato} disabled />
    </div>
    <div class="field">
      <label for="matricula">Matrícula <span class="req">*</span></label>
      <input id="matricula" class="input-plain" bind:value={datos.matricula} disabled />
    </div>
    <div class="field">
      <label for="cuatrimestre_cursar">Cuatrimestre a cursar <span class="req">*</span></label>
      <input id="cuatrimestre_cursar" class="input-plain" type="number" min="0" max="12"
        placeholder="0-12" bind:value={datos.cuatrimestre_a_cursar} />
    </div>
  </div>

  <div class="row-3">
    <div class="field">
      <label for="nombres">Nombre(s) <span class="req">*</span></label>
      <input id="nombres" class="input-plain" bind:value={datos.nombres} />
    </div>
    <div class="field">
      <label for="apellido_paterno">Apellido Paterno <span class="req">*</span></label>
      <input id="apellido_paterno" class="input-plain" bind:value={datos.apellido_paterno} />
    </div>
    <div class="field">
      <label for="apellido_materno">Apellido Materno <span class="req">*</span></label>
      <input id="apellido_materno" class="input-plain" bind:value={datos.apellido_materno} />
    </div>
  </div>

  <div class="row-3">
    <div class="field">
      <label for="programa_educativo">Programa educativo <span class="req">*</span></label>
      <input id="programa_educativo" class="input-plain" bind:value={datos.programa_educativo} />
    </div>
    <div class="field">
        <label>Turno <span class="req">*</span></label>
      <div class="checkbox-row">
        <label class="check-label">
          <input type="checkbox" checked={datos.turno === 'M'}
            on:change={() => datos.turno = 'M'} /> M
        </label>
        <label class="check-label">
          <input type="checkbox" checked={datos.turno === 'V'}
            on:change={() => datos.turno = 'V'} /> V
        </label>
      </div>
    </div>
    <div class="field">
      <label for="grupo">Grupo <span class="req">*</span></label>
      <input id="grupo" class="input-plain" bind:value={datos.grupo} />
    </div>
  </div>

  <div class="row-2">
    <div class="field">
      <label for="domicilio_calle">Domicilio (Calle) <span class="req">*</span></label>
      <input id="domicilio_calle" class="input-plain" bind:value={datos.domicilio_calle} />
    </div>
    <div class="field field-sm">
      <label for="domicilio_numero">No. <span class="req">*</span></label>
      <input id="domicilio_numero" class="input-plain" bind:value={datos.domicilio_numero} />
    </div>
  </div>

  <div class="row-2">
    <div class="field">
      <label for="colonia">Colonia <span class="req">*</span></label>
      <input id="colonia" class="input-plain" bind:value={datos.colonia} />
    </div>
    <div class="field">
      <label for="municipio">Municipio <span class="req">*</span></label>
      <input id="municipio" class="input-plain" bind:value={datos.municipio} />
    </div>
  </div>

  <div class="row-1">
    <div class="field">
      <label for="correo_electronico">Correo electrónico <span class="req">*</span></label>
      <input id="correo_electronico" class="input-plain" bind:value={datos.correo_electronico} disabled />
    </div>
  </div>

  <div class="row-3">
    <div class="field">
      <label for="estado_civil">Estado civil <span class="req">*</span></label>
      <input id="estado_civil" class="input-plain" bind:value={datos.estado_civil} />
    </div>
    <div class="field">
      <label for="edad">Edad <span class="req">*</span></label>
      <input id="edad" class="input-plain" type="number" bind:value={datos.edad} />
    </div>
    <div class="field">
      <label for="celular">Celular <span class="req">*</span></label>
      <input id="celular" class="input-plain" type="number" bind:value={datos.celular} />
    </div>
  </div>

  <div class="row-2">
    <div class="field">
      <label for="rfc">RFC <span class="req">*</span></label>
      <input id="rfc" class="input-plain" bind:value={datos.rfc} />
    </div>
    <div class="field">
      <label for="curp">CURP <span class="req">*</span></label>
      <input id="curp" class="input-plain" bind:value={datos.curp} />
    </div>
  </div>
</section>

<style>
  section { display: flex; flex-direction: column; gap: 16px; }
  .section-header { display: flex; align-items: center; gap: 8px; }
  .section-num { font-size: 18px; font-weight: 700; color: var(--orange); }
  .section-title { font-size: 17px; font-weight: 600; color: var(--text-primary); }
  .divider-orange { height: 2px; background: var(--orange); border-radius: 2px; opacity: 0.3; }
  .row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .row-1 { display: grid; grid-template-columns: 1fr; gap: 16px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .field-sm { max-width: 120px; }
  .req { color: var(--orange); }
  .checkbox-row {
    display: flex; gap: 20px; align-items: center;
    padding: 11px 14px;
    border: 1.5px solid var(--border-input);
    border-radius: var(--radius-input);
    background: var(--bg-card);
  }
  .check-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 14px; cursor: pointer; accent-color: var(--orange);
  }
  @media (max-width: 640px) {
    .row-3 { grid-template-columns: 1fr; }
    .row-2 { grid-template-columns: 1fr; }
  }
</style>