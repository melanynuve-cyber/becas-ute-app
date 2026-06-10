// src/lib/utils/solicitudHelper.js

// Saneamiento de campos financieros (Max 6 cifras fijas)
export function eliminarExponencial(valor) {
  if (!valor) return ''
  let cadena = valor.toString().toLowerCase().replace(/[^0-9.]/g, '')
  if (cadena.length > 6) {
    cadena = cadena.slice(0, 6)
  }
  return cadena ? parseFloat(cadena) : ''
}

// Filtro reactivo para impedir promedios/porcentajes mayores a 100
export function limpiarRangoCien(valor) {
  if (!valor) return ''
  let cadena = valor.toString().replace(/[^0-9.]/g, '')
  if (cadena.length > 5) cadena = cadena.slice(0, 5)
  const num = parseFloat(cadena)
  if (num > 100) return 100
  return cadena
}

// Validación principal de la solicitud
// Retorna { campos: { [fieldKey]: mensaje }, general: string } — general vacío si todo ok
export function validarSolicitud(form, archivos, total_egresos) {
  const d = form.datos_personales
  const campos = {}

  if (!d.nombres) campos.nombres = 'Falta nombre(s)'
  if (!d.apellido_paterno) campos.apellido_paterno = 'Falta apellido paterno'
  if (!d.apellido_materno) campos.apellido_materno = 'Falta apellido materno'
  if (d.cuatrimestre_a_cursar === '' || d.cuatrimestre_a_cursar == null) {
    campos.cuatrimestre_a_cursar = 'Ingresa el cuatrimestre a cursar'
  }
  if (!d.turno) campos.turno = 'Selecciona el turno'
  if (!d.grupo) campos.grupo = 'Ingresa el grupo'
  if (!d.domicilio_calle) campos.domicilio_calle = 'Falta la calle'
  if (!d.domicilio_numero) campos.domicilio_numero = 'Falta el número'
  if (!d.colonia) campos.colonia = 'Falta la colonia'
  if (!d.municipio) campos.municipio = 'Falta el municipio'
  if (!d.estado_civil) campos.estado_civil = 'Ingresa tu estado civil'

  // VALIDACIÓN DE EDAD
  const edadNum = parseInt(d.edad)
  if (isNaN(edadNum) || edadNum < 16 || edadNum > 90) {
    campos.edad = 'Edad inválida (mínimo 16 años)'
  }

  if (d.celular.length !== 10) campos.celular = 'El celular debe tener 10 dígitos'
  if (d.rfc.length !== 13) campos.rfc = 'El RFC debe tener 13 caracteres'
  if (d.curp.length !== 18) campos.curp = 'La CURP debe tener 18 caracteres'
  if (!form.beca_solicitada.tipo_beca) campos.tipo_beca = 'Selecciona un tipo de beca'

  if (!archivos.kardex) campos.kardex = 'Adjunta el Kárdex'
  if (!archivos.recibo_ingresos) campos.recibo_ingresos = 'Adjunta el Recibo de Ingresos'
  if (!archivos.recibo_servicio_publico) campos.recibo_servicio_publico = 'Adjunta el Recibo de Servicio Público'

  // VALIDACIÓN FINANCIERA
  const ingresosDeclarados = parseFloat(form.ingreso_mensual.monto_ingreso) || 0
  if (ingresosDeclarados <= 0) {
    campos.monto_ingreso = 'Ingreso mensual debe ser mayor a $0.00'
  }

  if (form.ingreso_mensual.numero_dependientes === '' || form.ingreso_mensual.numero_dependientes == null) {
    campos.numero_dependientes = 'Ingresa el número de dependientes'
  }

  if (total_egresos > ingresosDeclarados) {
    campos.total_egresos = 'Egresos no pueden ser mayores que ingresos'
  }

  const limiteMinimoEgresos = ingresosDeclarados * 0.80
  if (total_egresos < limiteMinimoEgresos) {
    campos.total_egresos = 'Egresos deben ser al menos 80% de ingresos'
  }

  // VALIDACIÓN DE RANGOS ACADÉMICOS
  if (form.beca_solicitada.tipo_solicitud === 'Nueva') {
    const promPrep = parseFloat(form.informacion_general.promedio_preparatoria)
    if (isNaN(promPrep) || promPrep < 1 || promPrep > 100) {
      campos.promedio_preparatoria = 'Promedio debe estar entre 1 y 100'
    }
  } else {
    const pctBeca = parseFloat(form.informacion_general.porcentaje_beca_anterior)
    const promCuat = parseFloat(form.informacion_general.promedio_cuatrimestre_anterior)

    if (isNaN(pctBeca) || pctBeca < 0 || pctBeca > 100) {
      campos.porcentaje_beca_anterior = 'Porcentaje debe estar entre 0 y 100'
    }
    if (isNaN(promCuat) || promCuat < 1 || promCuat > 100) {
      campos.promedio_cuatrimestre_anterior = 'Promedio debe estar entre 1 y 100'
    }
  }

  if (!form.informacion_general.otra_beca) {
    campos.otra_beca = 'Indica si recibes otra beca (escribe "No" si no tienes)'
  }

  const errores = Object.keys(campos)
  let general = ''
  if (errores.length > 0) {
    general = errores.length === 1
      ? `Falta ${errores.length} campo por llenar`
      : `Faltan ${errores.length} campos por llenar`
  }

  return { campos, general }
}