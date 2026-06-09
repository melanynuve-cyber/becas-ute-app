<script>
  // src/routes/solicitud/NuevaSolicitud.svelte
  // Importaciones desglosadas
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated } from '../../lib/stores/auth.js'
  import { eliminarExponencial, limpiarRangoCien, validarSolicitud } from '../../lib/utils/solicitudHelper.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import StepDatosPersonales from '../../lib/components/form/StepDatosPersonales.svelte'
  import StepBecaSolicitada  from '../../lib/components/form/StepBecaSolicitada.svelte'
  import StepInfoGeneral     from '../../lib/components/form/StepInfoGeneral.svelte'
  import StepIngreso         from '../../lib/components/form/StepIngreso.svelte'
  import StepEgreso          from '../../lib/components/form/StepEgreso.svelte'
  import StepDocumentos      from '../../lib/components/form/StepDocumentos.svelte'
  import SolicitudPreview    from '../../lib/components/form/SolicitudPreview.svelte'
  import PerfilModal         from '../../lib/components/layout/PerfilModal.svelte'

  // Variables de estado
  let showPerfil = false
  let alumno = null
  let enviando = false
  let errorGeneral = ''
  let solicitudId = null
  let folio = null
  let paso = 'formulario'

  const hoy = new Date()
  const dia = String(hoy.getDate()).padStart(2, '0')
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const anio = hoy.getFullYear()
  const fechaFormato = `${dia}/${mes}/${anio}`

  let archivos = {
    kardex: null,
    recibo_ingresos: null,
    recibo_servicio_publico: null,
    recibo_inscripcion: null
  }
  let erroresArchivos = {}

  let form = {
    cuatrimestre: '',
    tipo: 'Nueva',
    datos_personales: {
      fecha: fechaFormato,
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      matricula: '',
      programa_educativo: '',
      cuatrimestre_a_cursar: '',
      turno: '',
      grupo: '',
      domicilio_calle: '',
      domicilio_numero: '',
      colonia: '',
      municipio: '',
      correo_electronico: '',
      estado_civil: '',
      edad: '',
      celular: '',
      rfc: '',
      curp: ''
    },
    beca_solicitada: { 
      tipo_solicitud: 'Nueva', 
      tipo_beca: '' 
    },
    informacion_general: { 
      promedio_preparatoria: '', 
      porcentaje_beca_anterior: '', 
      promedio_cuatrimestre_anterior: '', 
      otra_beca: '' 
    },
    ingreso_mensual: { 
      monto_ingreso: '', 
      numero_dependientes: '' 
    },
    egreso_mensual: { 
      gastos_alimentacion: '', 
      gastos_educacion: '', 
      gastos_renta_hipoteca: '', 
      gastos_servicios: '', 
      gastos_varios: '' 
    }
  }

  // Tope de caracteres para campos de texto libre
  $: if (form.datos_personales.nombres) {
    form.datos_personales.nombres = form.datos_personales.nombres.slice(0, 35)
  }
  $: if (form.datos_personales.apellido_paterno) {
    form.datos_personales.apellido_paterno = form.datos_personales.apellido_paterno.slice(0, 25)
  }
  $: if (form.datos_personales.apellido_materno) {
    form.datos_personales.apellido_materno = form.datos_personales.apellido_materno.slice(0, 25)
  }
  $: if (form.datos_personales.programa_educativo) {
    form.datos_personales.programa_educativo = form.datos_personales.programa_educativo.slice(0, 60)
  }
  $: if (form.datos_personales.grupo) {
    form.datos_personales.grupo = form.datos_personales.grupo.slice(0, 25)
  }
  $: if (form.datos_personales.estado_civil) {
    form.datos_personales.estado_civil = form.datos_personales.estado_civil.slice(0, 15)
  }
  $: if (form.informacion_general.otra_beca) {
    form.informacion_general.otra_beca = form.informacion_general.otra_beca.slice(0, 50)
  }

  // Capa de saneamiento para Domicilio Completo
  $: if (form.datos_personales.domicilio_calle) {
    form.datos_personales.domicilio_calle = form.datos_personales.domicilio_calle.slice(0, 45)
  }
  $: if (form.datos_personales.domicilio_numero) {
    form.datos_personales.domicilio_numero = form.datos_personales.domicilio_numero.toString().slice(0, 25)
  }
  $: if (form.datos_personales.colonia) {
    form.datos_personales.colonia = form.datos_personales.colonia.slice(0, 25)
  }
  $: if (form.datos_personales.municipio) {
    form.datos_personales.municipio = form.datos_personales.municipio.slice(0, 25)
  }

  // Filtros de identificación
  $: if (form.datos_personales.edad) {
    form.datos_personales.edad = form.datos_personales.edad.toString().replace(/\D/g, '').slice(0, 2)
  }
  $: if (form.datos_personales.celular) {
    form.datos_personales.celular = form.datos_personales.celular.toString().replace(/\D/g, '').slice(0, 10)
  }
  $: if (form.datos_personales.curp) {
    form.datos_personales.curp = form.datos_personales.curp.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 18)
  }
  $: if (form.datos_personales.rfc) {
    form.datos_personales.rfc = form.datos_personales.rfc.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 13)
  }

  // Clampeo reactivo inmediato para Personas Dependientes (Rango 0 - 10)
  $: if (form.ingreso_mensual.numero_dependientes !== '') {
    const depVal = parseInt(form.ingreso_mensual.numero_dependientes)
    if (!isNaN(depVal)) {
      if (depVal < 0) form.ingreso_mensual.numero_dependientes = 0
      if (depVal > 10) form.ingreso_mensual.numero_dependientes = 10
    }
  }

  // Aplicación de saneamiento financiero reactivo
  $: if (form.ingreso_mensual.monto_ingreso) {
    form.ingreso_mensual.monto_ingreso = eliminarExponencial(form.ingreso_mensual.monto_ingreso)
  }
  $: if (form.egreso_mensual.gastos_alimentacion) {
    form.egreso_mensual.gastos_alimentacion = eliminarExponencial(form.egreso_mensual.gastos_alimentacion)
  }
  $: if (form.egreso_mensual.gastos_educacion) {
    form.egreso_mensual.gastos_educacion = eliminarExponencial(form.egreso_mensual.gastos_educacion)
  }
  $: if (form.egreso_mensual.gastos_renta_hipoteca) {
    form.egreso_mensual.gastos_renta_hipoteca = eliminarExponencial(form.egreso_mensual.gastos_renta_hipoteca)
  }
  $: if (form.egreso_mensual.gastos_servicios) {
    form.egreso_mensual.gastos_servicios = eliminarExponencial(form.egreso_mensual.gastos_servicios)
  }
  $: if (form.egreso_mensual.gastos_varios) {
    form.egreso_mensual.gastos_varios = eliminarExponencial(form.egreso_mensual.gastos_varios)
  }

  // Aplicación de saneamiento de rangos académicos
  $: if (form.informacion_general.promedio_preparatoria) {
    form.informacion_general.promedio_preparatoria = limpiarRangoCien(form.informacion_general.promedio_preparatoria)
  }
  $: if (form.informacion_general.porcentaje_beca_anterior) {
    form.informacion_general.porcentaje_beca_anterior = limpiarRangoCien(form.informacion_general.porcentaje_beca_anterior)
  }
  $: if (form.informacion_general.promedio_cuatrimestre_anterior) {
    form.informacion_general.promedio_cuatrimestre_anterior = limpiarRangoCien(form.informacion_general.promedio_cuatrimestre_anterior)
  }

  // Reductor dinámico del total de egresos
  $: total_egresos = [
    form.egreso_mensual.gastos_alimentacion,
    form.egreso_mensual.gastos_educacion,
    form.egreso_mensual.gastos_renta_hipoteca,
    form.egreso_mensual.gastos_servicios,
    form.egreso_mensual.gastos_varios
  ].reduce((sum, v) => sum + (parseFloat(v) || 0), 0)

  onMount(async () => {
    if (!get(isAuthenticated)) {
      navigate('/login', { replace: true })
      return
    }
    try {
      alumno = await api.alumno.me()
      const partes = alumno.nombre.trim().split(/\s+/).filter(Boolean)
      const len = partes.length

      // Parse flexible: soporta nombres de 1, 2, o 3+ palabras
      let nombres, apellidoPaterno, apellidoMaterno
      if (len === 1) {
        nombres = partes[0]
        apellidoPaterno = ''
        apellidoMaterno = ''
      } else if (len === 2) {
        nombres = partes[0]
        apellidoPaterno = partes[1]
        apellidoMaterno = ''
      } else {
        nombres = partes.slice(0, len - 2).join(' ')
        apellidoPaterno = partes[len - 2]
        apellidoMaterno = partes[len - 1]
      }

      form.datos_personales.correo_electronico = alumno.email
      form.datos_personales.matricula = alumno.matricula
      form.datos_personales.programa_educativo = alumno.carrera
      form.datos_personales.turno = alumno.turno === 'Matutino' ? 'M' : 'V'
      form.datos_personales.apellido_materno = apellidoMaterno
      form.datos_personales.apellido_paterno = apellidoPaterno
      form.datos_personales.nombres = nombres
    } catch {
      errorGeneral = 'No se pudieron cargar tus datos. Recarga la página.'
    }
  })

  function irAPreview() {
    if (form.beca_solicitada.tipo_solicitud === 'Nueva') {
      form.informacion_general.porcentaje_beca_anterior = ''
      form.informacion_general.promedio_cuatrimestre_anterior = ''
    } else {
      form.informacion_general.promedio_preparatoria = ''
    }

    errorGeneral = validarSolicitud(form, archivos, total_egresos)
    if (errorGeneral) { 
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return 
    }

    form.cuatrimestre = form.datos_personales.cuatrimestre_a_cursar
    form.tipo = form.beca_solicitada.tipo_solicitud
    paso = 'preview'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function enviar() {
    enviando = true
    errorGeneral = ''
    try {
      const payload = {
        datos_personales: form.datos_personales,
        beca_solicitada: form.beca_solicitada,
        informacion_general: form.informacion_general,
        ingreso_mensual: form.ingreso_mensual,
        egreso_mensual: { 
          ...form.egreso_mensual, 
          total_egresos 
        }
      }
      const fd = new FormData()
      fd.append('cuatrimestre', form.cuatrimestre)
      fd.append('tipo', form.tipo)
      fd.append('payload', JSON.stringify(payload))
      fd.append('kardex', archivos.kardex)
      fd.append('recibo_ingresos', archivos.recibo_ingresos)
      fd.append('recibo_servicio_publico', archivos.recibo_servicio_publico)
      
      if (archivos.recibo_inscripcion) {
        fd.append('recibo_inscripcion', archivos.recibo_inscripcion)
      }
      
      const res = await api.solicitudes.crear(fd)
      solicitudId = res.solicitud_id
      folio = res.folio || null
      paso = 'confirmacion'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      errorGeneral = e.message || 'Error al enviar la solicitud'
      paso = 'preview'
    } finally {
      enviando = false
    }
  }
</script>

<svelte:head>
  <title>Nueva solicitud | Becas UTE</title>
</svelte:head>

<Navbar onAlumnoClick={() => showPerfil = true} />
<PerfilModal bind:show={showPerfil} {alumno} />

<div style="padding-top: 56px;">

  {#if paso === 'formulario'}
    <div class="page">
      <div class="form-card">
        <h1 class="form-title">Nueva Solicitud de Beca Interna</h1>

        {#if errorGeneral}
          <div class="error-msg">{errorGeneral}</div>
        {/if}

        <StepDatosPersonales bind:datos={form.datos_personales} {fechaFormato} />
        <StepBecaSolicitada bind:form />
        <StepInfoGeneral bind:info={form.informacion_general} tipoSolicitud={form.beca_solicitada.tipo_solicitud} />
        <StepIngreso bind:ingreso={form.ingreso_mensual} />
        <StepEgreso bind:egreso={form.egreso_mensual} />
        <StepDocumentos bind:archivos bind:erroresArchivos />

        <div class="form-actions">
          <button class="btn-primary" on:click={irAPreview}>
            Revisar Solicitud →
          </button>
        </div>
      </div>
    </div>

  {:else if paso === 'preview'}
    <div class="page">
      <SolicitudPreview
        {form} 
        {archivos} 
        {total_egresos} 
        {enviando} 
        {errorGeneral}
        onRegresar={() => { paso = 'formulario'; window.scrollTo({ top: 0 }); }}
        onEnviar={enviar}
      />
    </div>

  {:else if paso === 'confirmacion'}
    <div class="page">
      <div class="form-card confirm-card">
        <div class="confirm-icon">
          <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 class="form-title">¡Solicitud Enviada Exitosamente!</h1>
        {#if folio}
          <p style="color:var(--orange); text-align:center; font-size:18px; font-weight:700; margin:0;">
            Folio: {folio}
          </p>
        {/if}
        <p style="color:var(--text-secondary); text-align:center; font-size:14px; max-width:380px; line-height:1.5">
          Tu expediente ha sido registrado de forma correcta y se encuentra en la bandeja de revisión de los coordinadores.
        </p>
        <div class="confirm-actions">
          <button class="btn-primary" on:click={() => navigate(`/solicitud/${solicitudId}`)}>
            Ver mi Solicitud
          </button>
          <button class="btn-outline" on:click={() => navigate('/dashboard')}>
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  {/if}

</div>

<style>
  .page { 
    max-width: 1000px;
    margin: 0 auto; 
    padding: 40px 24px 64px; 
  }
  
  .form-card {
    background: var(--bg-card);
    border-radius: var(--radius-card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card);
    padding: 36px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .form-title { 
    font-size: 20px; 
    font-weight: 700;
    color: var(--text-primary); 
    letter-spacing: -0.02em;
  }
  
  .form-actions { 
    display: flex; 
    justify-content: flex-end; 
  }

  .confirm-card { 
    max-width: 500px; 
    margin: 40px auto 0;
    text-align: center; 
    align-items: center; 
    padding: 40px 32px;
    gap: 20px;
  }
  
  .confirm-icon {
    width: 64px; 
    height: 64px; 
    border-radius: 50%;
    background: rgba(34, 197, 94, 0.1);
    color: var(--success);
    display: flex; 
    align-items: center; 
    justify-content: center;
  }
  
  .confirm-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 280px;
    margin-top: 8px;
  }
</style>