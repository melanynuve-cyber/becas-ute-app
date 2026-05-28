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
export function validarSolicitud(form, archivos, total_egresos) {
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