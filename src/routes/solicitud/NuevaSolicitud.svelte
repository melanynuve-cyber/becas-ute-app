<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/Navbar.svelte'

  import StepDatosPersonales from '../../lib/components/form/StepDatosPersonales.svelte'
  import StepBecaSolicitada  from '../../lib/components/form/StepBecaSolicitada.svelte'
  import StepInfoGeneral     from '../../lib/components/form/StepInfoGeneral.svelte'
  import StepIngreso         from '../../lib/components/form/StepIngreso.svelte'
  import StepEgreso          from '../../lib/components/form/StepEgreso.svelte'
  import StepDocumentos      from '../../lib/components/form/StepDocumentos.svelte'
  import SolicitudPreview    from '../../lib/components/form/SolicitudPreview.svelte'
  import PerfilModal from '../../lib/components/PerfilModal.svelte'
  
  let showPerfil = false
  let alumno = null
  let enviando = false
  let errorGeneral = ''
  let solicitudId = null
  let paso = 'formulario'

  const hoy = new Date()
  const fechaFormato = `${String(hoy.getDate()).padStart(2,'0')}/${String(hoy.getMonth()+1).padStart(2,'0')}/${hoy.getFullYear()}`

  let archivos = { kardex: null, recibo_ingresos: null, recibo_servicio_publico: null, recibo_inscripcion: null }
  let erroresArchivos = {}

  let form = {
    cuatrimestre: '',
    tipo: 'Nueva',
    datos_personales: {
      fecha: fechaFormato, nombres: '', apellido_paterno: '', apellido_materno: '',
      matricula: '', programa_educativo: '', cuatrimestre_a_cursar: '', turno: '',
      grupo: '', domicilio_calle: '', domicilio_numero: '', colonia: '', municipio: '',
      correo_electronico: '', estado_civil: '', edad: '', celular: '', rfc: '', curp: '',
    },
    beca_solicitada: { tipo_solicitud: 'Nueva', tipo_beca: '' },
    informacion_general: { promedio_preparatoria: '', porcentaje_beca_anterior: '', promedio_cuatrimestre_anterior: '', otra_beca: '' },
    ingreso_mensual: { monto_ingreso: '', numero_dependientes: '' },
    egreso_mensual: { gastos_alimentacion: '', gastos_educacion: '', gastos_renta_hipoteca: '', gastos_servicios: '', gastos_varios: '' },
  }

  $: total_egresos = [
    form.egreso_mensual.gastos_alimentacion, form.egreso_mensual.gastos_educacion,
    form.egreso_mensual.gastos_renta_hipoteca, form.egreso_mensual.gastos_servicios,
    form.egreso_mensual.gastos_varios,
  ].reduce((sum, v) => sum + (parseFloat(v) || 0), 0)

  onMount(async () => {
    if (!get(isAuthenticated)) { navigate('/login', { replace: true }); return }
    try {
      alumno = await api.alumno.me()
      const partes = alumno.nombre.trim().split(' ')
      form.datos_personales.correo_electronico = alumno.email
      form.datos_personales.matricula          = alumno.matricula
      form.datos_personales.programa_educativo = alumno.carrera
      form.datos_personales.turno              = alumno.turno === 'Matutino' ? 'M' : 'V'
      form.datos_personales.apellido_materno   = partes[partes.length - 1] || ''
      form.datos_personales.apellido_paterno   = partes[partes.length - 2] || ''
      form.datos_personales.nombres            = partes.slice(0, partes.length - 2).join(' ') || partes[0]
    } catch (e) {
      errorGeneral = 'No se pudieron cargar tus datos. Recarga la página.'
    }
  })

  function validar() {
    const d = form.datos_personales
    if (!d.nombres || !d.apellido_paterno || !d.apellido_materno) return 'Completa nombre y apellidos'
    if (!d.cuatrimestre_a_cursar) return 'Ingresa el cuatrimestre a cursar'
    if (!d.turno)   return 'Selecciona el turno'
    if (!d.grupo)   return 'Ingresa el grupo'
    if (!d.domicilio_calle || !d.domicilio_numero) return 'Ingresa el domicilio completo'
    if (!d.colonia || !d.municipio) return 'Ingresa colonia y municipio'
    if (!d.estado_civil || !d.edad) return 'Ingresa estado civil y edad'
    if (!d.celular) return 'Ingresa el celular'
    if (!d.rfc)     return 'Ingresa el RFC'
    if (!d.curp)    return 'Ingresa el CURP'
    if (form.beca_solicitada.tipos_beca.length === 0) return 'Selecciona al menos un tipo de beca'
    if (!archivos.kardex)                  return 'Adjunta el Kárdex'
    if (!archivos.recibo_ingresos)         return 'Adjunta el Recibo de Ingresos'
    if (!archivos.recibo_servicio_publico) return 'Adjunta el Recibo de Servicio Público'
    if (!archivos.recibo_inscripcion)      return 'Adjunta el Comprobante de Inscripción'
    if (!form.ingreso_mensual.monto_ingreso)       return 'Ingresa el monto de ingreso'
    if (!form.ingreso_mensual.numero_dependientes) return 'Ingresa el número de dependientes'
    if (!form.egreso_mensual.gastos_alimentacion)  return 'Ingresa los gastos de alimentación'
    if (!form.egreso_mensual.gastos_educacion)     return 'Ingresa los gastos de educación'
    if (!form.egreso_mensual.gastos_renta_hipoteca) return 'Ingresa los gastos de renta'
    if (!form.egreso_mensual.gastos_servicios)     return 'Ingresa los gastos de servicios'
    if (!form.egreso_mensual.gastos_varios)        return 'Ingresa los gastos varios'
    if (!form.informacion_general.otra_beca)       return 'Indica si recibes otra beca (escribe "No" si no tienes)'
    if (form.beca_solicitada.tipo_solicitud === 'Renovacion' && !form.informacion_general.porcentaje_beca_anterior)
      return 'Ingresa el porcentaje de beca anterior'
    return ''
  }

  function irAPreview() {
    if (form.beca_solicitada.tipo_solicitud === 'Nueva') {
      form.informacion_general.porcentaje_beca_anterior = ''
      form.informacion_general.promedio_cuatrimestre_anterior = ''
    } else {
      form.informacion_general.promedio_preparatoria = ''
    }
    errorGeneral = validar()
    if (errorGeneral) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
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
        egreso_mensual: { ...form.egreso_mensual, total_egresos },
      }
      const fd = new FormData()
      fd.append('cuatrimestre', form.cuatrimestre)
      fd.append('tipo', form.tipo)
      fd.append('payload', JSON.stringify(payload))
      fd.append('kardex', archivos.kardex)
      fd.append('recibo_ingresos', archivos.recibo_ingresos)
      fd.append('recibo_servicio_publico', archivos.recibo_servicio_publico)
      fd.append('recibo_inscripcion', archivos.recibo_inscripcion)
      const res = await api.solicitudes.crear(fd)
      solicitudId = res.solicitud_id
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
      <StepInfoGeneral     bind:info={form.informacion_general} tipoSolicitud={form.beca_solicitada.tipo_solicitud} />
      <StepIngreso         bind:ingreso={form.ingreso_mensual} />
      <StepEgreso          bind:egreso={form.egreso_mensual} />
      <StepDocumentos      bind:archivos bind:erroresArchivos />

      <div class="form-actions">
        <button class="btn-primary" on:click={irAPreview}>Revisar Solicitud →</button>
      </div>
    </div>
  </div>

  {:else if paso === 'preview'}
  <div class="page">
    <SolicitudPreview
      {form} {archivos} {total_egresos} {enviando} {errorGeneral}
      onRegresar={() => { paso = 'formulario'; window.scrollTo({ top: 0 }) }}
      onEnviar={enviar}
    />
  </div>

  {:else if paso === 'confirmacion'}
  <div class="page">
    <div class="form-card confirm-card">
      <div class="confirm-icon">✓</div>
      <h1 class="form-title">¡Solicitud Enviada Exitosamente!</h1>
      <p style="color:var(--text-secondary);text-align:center">Tu solicitud ha sido recibida y está siendo procesada.</p>
      <button class="btn-primary" style="max-width:260px;margin:0 auto" on:click={() => navigate('/dashboard')}>
        Volver al Inicio
      </button>
    </div>
  </div>
  {/if}

</div>

<style>
  .page { max-width: 900px; margin: 0 auto; padding: 32px 16px 64px; }
  .form-card {
    background: var(--bg-card); border-radius: var(--radius-card);
    box-shadow: var(--shadow-card); padding: 32px 36px;
    display: flex; flex-direction: column; gap: 32px;
  }
  .form-title { font-size: 22px; font-weight: 700; color: var(--text-primary); }
  .form-actions { display: flex; justify-content: flex-end; }
  .confirm-card { max-width: 560px; margin: 0 auto; text-align: center; align-items: center; }
  .confirm-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: var(--orange-light); color: var(--orange);
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; font-weight: 700;
  }
</style>
