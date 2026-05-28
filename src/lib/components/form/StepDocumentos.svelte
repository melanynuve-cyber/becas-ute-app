<script>
  // src/lib/components/form/StepDocumentos.svelte
  import StepHeader from '../ui/StepHeader.svelte'
  import DocUpload from '../ui/DocUpload.svelte'

  // Propiedades expuestas estructuradas
  export let archivos
  export let erroresArchivos = {}

  // Catálogo estructural de la documentación obligatoria y opcional
  const docs = [
    { key: 'kardex', label: 'A. Kárdex (PDF)', requerido: true },
    { key: 'recibo_ingresos', label: 'B. Recibo de Ingresos (PDF)', requerido: true },
    { key: 'recibo_servicio_publico', label: 'C. Recibo de Servicio Público (PDF)', requerido: true },
    { key: 'recibo_inscripcion', label: 'D. Comprobante de Inscripción (PDF)', requerido: false }
  ]

  function handleFileChange(e, key) {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      erroresArchivos = { ...erroresArchivos, [key]: 'Solo se aceptan archivos PDF' }
      return
    }
    
    erroresArchivos = { ...erroresArchivos, [key]: '' }
    archivos = { ...archivos, [key]: file }
  }

  function quitarArchivo(key) {
    archivos = { ...archivos, [key]: null }
  }
</script>

<section>
  <StepHeader num="6" title="Documentos Adjuntos" />
  
  <p class="section-hint">
    Los documentos A, B y C son obligatorios. D puede adjuntarse después. Solo se aceptan archivos PDF.
  </p>

  <div class="docs-grid">
    {#each docs as doc}
      <DocUpload 
        label={doc.label} 
        requerido={doc.requerido}
        file={archivos[doc.key]}
        error={erroresArchivos[doc.key]}
        onUpload={(e) => handleFileChange(e, doc.key)}
        onRemove={() => quitarArchivo(doc.key)}
      />
    {/each}
  </div>
</section>

<style>
  section { 
    display: flex;
    flex-direction: column; 
    gap: 16px; 
  }
  
  .section-hint { 
    font-size: 13px; 
    color: var(--text-secondary);
    margin-top: -8px;
  }
  
  .docs-grid { 
    display: grid;
    grid-template-columns: 1fr 1fr; 
    gap: 12px;
  }
  
  @media (max-width: 768px) {
    .docs-grid { 
      grid-template-columns: 1fr;
    }
  }
</style>