<script>
  // src/routes/solicitud/NuevaSolicitud.svelte
  // Importaciones desglosadas
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated } from '../../lib/stores/auth.js'
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

  // Saneamiento de campos financieros (Max 6 cifras fijas)
  function eliminarExponencial(valor) {
    if (!valor) return ''
    let cadena = valor.toString().toLowerCase().replace(/[^0-9.]/g, '')
    if (cadena.length > 6) {
      cadena = cadena.slice(0, 6)
    }
    return cadena ? parseFloat(cadena) : ''
  }

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

  // Filtro reactivo para impedir promedios/porcentajes mayores a 100
  function limpiarRangoCien(valor) {
    if (!valor) return ''
    let cadena = valor.toString().replace(/[^0-9.]/g, '')
    if (cadena.length > 5) cadena = cadena.slice(0, 5)
    const num = parseFloat(cadena)
    if (num > 100) return 100
    return cadena
  }

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
      const partes = alumno.nombre.trim().split(' ')
      
      form.datos_personales.correo_electronico = alumno.email
      form.datos_personales.matricula = alumno.matricula
      form.datos_personales.programa_educativo = alumno.carrera
      form.datos_personales.turno = alumno.turno === 'Matutino' ? 'M' : 'V'
      form.datos_personales.apellido_materno = partes[partes.length - 1] || ''
      form.datos_personales.apellido_paterno = partes[partes.length - 2] || ''
      form.datos_personales.nombres = partes.slice(0, partes.length - 2).join(' ') || partes[0]
    } catch {
      errorGeneral = 'No se pudieron cargar tus datos. Recarga la página.'
    }
  })

  function validar() {
    const d = form.datos_personales
    if (!d.nombres || !d.apellido_paterno || !d.apellido_materno) {
      return 'Completa nombre y apellidos'
    }
    if (d.cuatrimestre_a_cursar === '' || d.cuatrimestre_a_cursar == null) {
      return 'Ingresa el cuatrimestre a cursar'
    }
    if (!d.turno) {
      return 'Selecciona el turno'
    }
    if (!d.grupo) {
      return 'Ingresa el grupo'
    }
    if (!d.domicilio_calle || !d.domicilio_numero) {
      return 'Ingresa el domicilio completo'
    }
    if (!d.colonia || !d.municipio) {
      return 'Ingresa colonia y municipio'
    }
    if (!d.estado_civil) {
      return 'Ingresa tu estado civil'
    }

    // VALIDACIÓN DE EDAD
    const edadNum = parseInt(d.edad)
    if (isNaN(edadNum) || edadNum < 16 || edadNum > 90) {
      return 'Ingresa una edad válida para un estudiante universitario (Mínimo 16 años).'
    }

    if (d.celular.length !== 10) {
      return 'El número de celular debe tener exactamente 10 dígitos'
    }
    if (d.rfc.length !== 13) {
      return 'El RFC debe tener exactamente 13 caracteres'
    }
    if (d.curp.length !== 18) {
      return 'La CURP debe tener exactamente 18 caracteres'
    }
    if (!form.beca_solicitada.tipo_beca) {
      return 'Selecciona un tipo de beca'
    }
    if (!archivos.kardex) {
      return 'Adjunta el Kárdex'
    }
    if (!archivos.recibo_ingresos) {
      return 'Adjunta el Recibo de Ingresos'
    }
    if (!archivos.recibo_servicio_publico) {
      return 'Adjunta el Recibo de Servicio Público'
    }

    // VALIDACIÓN FINANCIERA: Rango del 80% al 100% estricto
    const ingresosDeclarados = parseFloat(form.ingreso_mensual.monto_ingreso) || 0
    if (ingresosDeclarados <= 0) {
      return 'El monto de ingreso mensual debe ser mayor a $0.00'
    }
    
    if (form.ingreso_mensual.numero_dependientes === '' || form.ingreso_mensual.numero_dependientes == null) {
      return 'Ingresa el número de dependientes'
    }

    if (total_egresos > ingresosDeclarados) {
      return 'Error de consistencia: El total de egresos mensuales no puede ser mayor que el ingreso mensual declarado.'
    }
    
    const limiteMinimoEgresos = ingresosDeclarados * 0.80
    if (total_egresos < limiteMinimoEgresos) {
      return 'Error socioeconómico institucional: Para validar la necesidad de apoyo, tus egresos mensuales deben representar al menos el 80% de tus ingresos declarados.'
    }

    // VALIDACIÓN DE RANGOS ACADÉMICOS
    if (form.beca_solicitada.tipo_solicitud === 'Nueva') {
      const promPrep = parseFloat(form.informacion_general.promedio_preparatoria)
      if (isNaN(promPrep) || promPrep < 1 || promPrep > 100) {
        return 'El promedio general de preparatoria debe ser una calificación válida entre 1 y 100.'
      }
    } else {
      const pctBeca = parseFloat(form.informacion_general.porcentaje_beca_anterior)
      const promCuat = parseFloat(form.informacion_general.promedio_cuatrimestre_anterior)
      
      if (isNaN(pctBeca) || pctBeca < 0 || pctBeca > 100) {
        return 'El porcentaje de beca cuatrimestre anterior debe estar entre 0 y 100.'
      }
      if (isNaN(promCuat) || promCuat < 1 || promCuat > 100) {
        return 'El promedio del cuatrimestre anterior debe ser una calificación válida entre 1 y 100.'
      }
    }

    if (!form.informacion_general.otra_beca) {
      return 'Indica si recibes otra beca (escribe "No" si no tienes)'
    }
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