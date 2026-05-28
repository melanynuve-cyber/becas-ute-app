<script>
  // src/lib/components/form/SolicitudPreview.svelte
  import { tiposBeca, nombresDocumentos } from '../../utils/constants.js'
  import PreviewField from '../ui/PreviewField.svelte'

  // Propiedades expuestas de control de datos
  export let form
  export let archivos
  export let total_egresos
  export let enviando
  export let errorGeneral
  export let onRegresar
  export let onEnviar

  // Estado local para la confirmación de veracidad
  let confirmado = false
</script>

<div class="form-card">
  <div class="preview-header">
    <div class="preview-icon">✓</div>
    <div>
      <h1 class="form-title">Vista Previa de Solicitud</h1>
      <p class="preview-sub">Revisa cuidadosamente tu información antes de enviar</p>
    </div>
  </div>

  {#if errorGeneral}
    <div class="error-msg">{errorGeneral}</div>
  {/if}

  <div class="preview-section">
    <h3 class="preview-section-title">Datos Personales</h3>
    <div class="preview-grid">
      <PreviewField label="Nombre(s)" value={form.datos_personales.nombres} />
      <PreviewField label="Apellido Paterno" value={form.datos_personales.apellido_paterno} />
      <PreviewField label="Apellido Materno" value={form.datos_personales.apellido_materno} />
      <PreviewField label="Matrícula" value={form.datos_personales.matricula} isMono={true} />
      <PreviewField label="Programa educativo" value={form.datos_personales.programa_educativo} />
      <PreviewField label="Cuatrimestre a cursar" value={`${form.datos_personales.cuatrimestre_a_cursar}° Cuatrimestre`} />
      <PreviewField label="Turno" value={form.datos_personales.turno === 'M' ? 'Matutino' : 'Vespertino'} />
      <PreviewField label="Grupo" value={form.datos_personales.grupo} isMono={true} />
      <PreviewField label="Domicilio" value={`${form.datos_personales.domicilio_calle} ${form.datos_personales.domicilio_numero}, ${form.datos_personales.colonia}, ${form.datos_personales.municipio}`} />
      <PreviewField label="Correo electrónico" value={form.datos_personales.correo_electronico} />
      <PreviewField label="Estado civil" value={form.datos_personales.estado_civil} />
      <PreviewField label="Edad" value={`${form.datos_personales.edad} años`} />
      <PreviewField label="Celular" value={form.datos_personales.celular} />
      <PreviewField label="RFC" value={form.datos_personales.rfc} isMono={true} />
      <PreviewField label="CURP" value={form.datos_personales.curp} isMono={true} />
    </div>
  </div>

  <div class="preview-section">
    <h3 class="preview-section-title">Beca Solicitada</h3>
    <div class="preview-grid">
      <PreviewField label="Tipo de solicitud" value={form.beca_solicitada.tipo_solicitud} />
      <PreviewField label="Tipos de beca" value={tiposBeca.find(b => b.key === form.beca_solicitada.tipo_beca)?.label || 'Ninguna seleccionada'} />
    </div>
  </div>

  <div class="preview-section">
    <h3 class="preview-section-title">Información General</h3>
    <div class="preview-grid">
      <PreviewField label="Promedio preparatoria" value={form.informacion_general.promedio_preparatoria} />
      <PreviewField label="% beca cuatrimestre anterior" value={form.informacion_general.porcentaje_beca_anterior} />
      <PreviewField label="Promedio cuatrimestre anterior" value={form.informacion_general.promedio_cuatrimestre_anterior} />
      <PreviewField label="Otra beca" value={form.informacion_general.otra_beca} />
    </div>
  </div>

  <div class="preview-section">
    <h3 class="preview-section-title">Ingreso Mensual</h3>
    <div class="preview-grid">
      <PreviewField label="Monto de ingreso" value={`$${form.ingreso_mensual.monto_ingreso || '0'}`} />
      <PreviewField label="Personas dependientes" value={form.ingreso_mensual.numero_dependientes || '0'} />
    </div>
  </div>

  <div class="preview-section">
    <h3 class="preview-section-title">Egreso Mensual</h3>
    <div class="preview-grid">
      <PreviewField label="Alimentación" value={`$${form.egreso_mensual.gastos_alimentacion || '0'}`} />
      <PreviewField label="Educación" value={`$${form.egreso_mensual.gastos_educacion || '0'}`} />
      <PreviewField label="Renta / Hipoteca" value={`$${form.egreso_mensual.gastos_renta_hipoteca || '0'}`} />
      <PreviewField label="Servicios" value={`$${form.egreso_mensual.gastos_servicios || '0'}`} />
      <PreviewField label="Gastos varios" value={`$${form.egreso_mensual.gastos_varios || '0'}`} />
      <PreviewField label="Total egresos" value={`$${total_egresos.toFixed(2)}`} highlight={true} />
    </div>
  </div>

  <div class="preview-section">
    <h3 class="preview-section-title">Documentos Adjuntos</h3>
    <div class="docs-grid">
      {#each Object.entries(nombresDocumentos) as [key, nombre]}
        <div class="doc-selected">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2">
            <path d="M14 2 H6 a2 2 0 0 0-2 2 v16 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2-2 V8z" />
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <div class="doc-meta-box">
            <span class="doc-title-label">{nombre}</span>
            <span class="doc-name">{archivos[key]?.name || '—'}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <label class="confirm-check">
    <input type="checkbox" bind:checked={confirmado} />
    <span>
      Confirmo que mi información y datos son correctos. Entiendo que proporcionar información falsa puede resultar en la cancelación de mi solicitud.
    </span>
  </label>

  <div class="form-actions">
    <button class="btn-outline" on:click={onRegresar}>
      ← Regresar a Editar
    </button>
    <button 
      class="btn-primary" 
      disabled={!confirmado || enviando} 
      on:click={onEnviar}
    >
      {enviando ? 'Enviando...' : '✓ Enviar Solicitud Final'}
    </button>
  </div>
</div>

<style>
  .form-card {
    background: var(--bg-card);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    padding: 32px 36px;
    display: flex; 
    flex-direction: column; 
    gap: 28px;
  }

  .preview-header { 
    display: flex;
    align-items: center; 
    gap: 16px;
  }

  .preview-icon {
    width: 48px; 
    height: 48px; 
    border-radius: 50%;
    background: var(--orange-light);
    color: var(--orange);
    display: flex;
    align-items: center; 
    justify-content: center;
    font-size: 22px; 
    font-weight: 700; 
    flex-shrink: 0;
  }

  .form-title { 
    font-size: 22px;
    font-weight: 700; 
    margin: 0; 
  }

  .preview-sub { 
    font-size: 14px; 
    color: var(--text-secondary); 
    margin-top: 4px;
  }

  .preview-section { 
    display: flex;
    flex-direction: column; 
    gap: 12px;
  }

  .preview-section-title {
    font-size: 15px; 
    font-weight: 600; 
    color: var(--text-primary);
    padding-bottom: 8px;
    border-bottom: 1.5px solid var(--border);
  }

  .preview-grid { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 14px 32px;
  }

  .docs-grid { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 12px;
  }

  .doc-selected {
    display: flex;
    align-items: center; 
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-input);
    background: var(--bg-page);
  }

  .doc-meta-box {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .doc-title-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .doc-name {
    font-size: 12px; 
    color: var(--text-secondary);
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis;
  }

  .confirm-check {
    display: flex; 
    align-items: flex-start; 
    gap: 10px;
    font-size: 13px; 
    color: var(--text-primary);
    cursor: pointer;
    accent-color: var(--orange); 
    line-height: 1.5;
  }

  .form-actions {
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 12px;
  }

  @media (max-width: 768px) {
    .form-card { 
      padding: 24px 16px;
    }
    .preview-grid { 
      grid-template-columns: 1fr; 
      gap: 12px;
    }
    .docs-grid { 
      grid-template-columns: 1fr;
    }
    .form-actions { 
      grid-template-columns: 1fr; 
    }
  }
</style>