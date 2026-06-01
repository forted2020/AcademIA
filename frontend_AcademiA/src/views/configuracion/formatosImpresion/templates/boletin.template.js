// templates/boletin.template.js
// Template de Boletín de Calificaciones.
// Para agregar o modificar campos configurables: editar el array `campos`.
// Para cambiar el diseño del documento: editar la función `generarHtml`.

import { datosMuestra } from './datosMuestra'

const DEFAULTS_GLOBALES = {
  nombre_institucion: 'Institución Educativa',
  subtitulo_institucion: '',
  color_primario: '#0369a1',
  color_encabezado: '#0f172a',
  logo_base64: null,
  logo_mime_type: 'image/png',
}

export const boletinTemplate = {
  codigo: 'boletin',
  nombre: 'Boletín de Calificaciones',
  descripcion: 'Informe de notas por estudiante y ciclo lectivo',
  orientacion_default: 'portrait',

  campos: [
    {
      clave: 'titulo_documento',
      tipo: 'text',
      label: 'Título del documento',
      default: 'BOLETÍN DE CALIFICACIONES',
    },
    {
      clave: 'texto_aprobacion',
      tipo: 'text',
      label: 'Texto de nota de aprobación',
      default: 'La nota mínima de aprobación es 6 (seis).',
    },
    {
      clave: 'mostrar_promedio',
      tipo: 'boolean',
      label: 'Mostrar columna Promedio',
      default: true,
    },
    {
      clave: 'mostrar_columna_concepto',
      tipo: 'boolean',
      label: 'Mostrar columna Concepto',
      default: true,
    },
    {
      clave: 'mostrar_logo',
      tipo: 'boolean',
      label: 'Mostrar logo de la institución',
      default: true,
    },
    {
      clave: 'mostrar_fecha_emision',
      tipo: 'boolean',
      label: 'Mostrar fecha de emisión',
      default: true,
    },
    {
      clave: 'texto_pie',
      tipo: 'textarea',
      label: 'Texto de pie de página',
      default: '',
      placeholder: 'Si está vacío, se usa el pie global de la institución',
    },
    {
      clave: 'texto_firma',
      tipo: 'text',
      label: 'Línea de firma',
      default: '',
      placeholder: 'Ej: Dirección — Secretaría Académica',
    },
    {
      clave: 'orientacion',
      tipo: 'select',
      label: 'Orientación del PDF',
      default: 'portrait',
      opciones: [
        { value: 'portrait', label: 'Vertical (retrato)' },
        { value: 'landscape', label: 'Horizontal (apaisado)' },
      ],
    },
  ],

  datosMuestra: datosMuestra.boletin,

  generarHtml(configGlobal = {}, config = {}, datos = {}) {
    const g = { ...DEFAULTS_GLOBALES, ...configGlobal }
    const c = config

    const nombre_inst   = g.nombre_institucion || 'Institución Educativa'
    const subtitulo     = g.subtitulo_institucion || ''
    const colorPrimario = g.color_primario || '#0369a1'
    const colorHeader   = g.color_encabezado || '#0f172a'
    const logo          = g.logo_base64
    const logoMime      = g.logo_mime_type || 'image/png'

    const titulo           = c.titulo_documento ?? 'BOLETÍN DE CALIFICACIONES'
    const mostrarPromedio  = c.mostrar_promedio !== '0' && c.mostrar_promedio !== false
    const mostrarLogo      = (c.mostrar_logo !== '0' && c.mostrar_logo !== false) && !!logo
    const mostrarFecha     = c.mostrar_fecha_emision !== '0' && c.mostrar_fecha_emision !== false
    const textoAprobacion  = c.texto_aprobacion ?? 'La nota mínima de aprobación es 6 (seis).'
    const textoPie         = c.texto_pie || g.texto_pie_global || ''
    const textoFirma       = c.texto_firma || ''

    const { nombreEstudiante = 'Apellido, Nombre', cicloNombre = 'Ciclo Lectivo', columnas = [], filas = [] } = datos

    const encabezadoCols = [
      '<th style="text-align:left;padding:7px 10px;background:' + colorPrimario + ';color:#fff;font-weight:600;font-size:11px;border:none;">Materia</th>',
      ...columnas.map(c => `<th style="text-align:center;padding:7px 8px;background:${colorPrimario};color:#fff;font-weight:600;font-size:11px;border:none;">${c.label}</th>`),
      mostrarPromedio ? `<th style="text-align:center;padding:7px 8px;background:${colorPrimario};color:#fff;font-weight:600;font-size:11px;border:none;">Promedio</th>` : '',
    ].join('')

    const filasCols = filas.map((fila, i) => {
      const bg = i % 2 === 0 ? '#fff' : '#f5f9fc'
      const prom = fila.promedio
      const aprobado = prom != null && prom >= 6
      const promBadge = prom != null
        ? `<span style="display:inline-block;padding:2px 8px;border-radius:12px;font-weight:700;font-size:11px;background:${aprobado ? '#dcfce7' : '#fee2e2'};color:${aprobado ? '#166534' : '#991b1b'};">${prom}</span>`
        : '<span style="color:#94a3b8;">—</span>'
      return `
        <tr style="background:${bg};">
          <td style="padding:7px 10px;font-size:11px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${fila.nombre_materia}</td>
          ${columnas.map(col => `<td style="text-align:center;padding:7px 8px;font-size:11px;border-bottom:1px solid #e2e8f0;color:#374151;">${fila.calificaciones[col.id_tipo_nota] != null ? fila.calificaciones[col.id_tipo_nota] : '<span style="color:#94a3b8;">—</span>'}</td>`).join('')}
          ${mostrarPromedio ? `<td style="text-align:center;padding:7px 8px;border-bottom:1px solid #e2e8f0;">${promBadge}</td>` : ''}
        </tr>`
    }).join('')

    const logoHtml = mostrarLogo
      ? `<img src="data:${logoMime};base64,${logo}" style="max-height:60px;max-width:120px;object-fit:contain;" alt="Logo" />`
      : ''

    const fechaHtml = mostrarFecha
      ? `<div style="font-size:9px;color:#64748b;margin-top:4px;">Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}</div>`
      : ''

    const pieHtml = textoPie
      ? `<div style="margin-top:24px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:9px;color:#64748b;text-align:center;">${textoPie}</div>`
      : ''

    const firmaHtml = textoFirma
      ? `<div style="margin-top:32px;text-align:center;"><div style="display:inline-block;border-top:1px solid #0f172a;padding-top:6px;font-size:10px;color:#374151;min-width:200px;">${textoFirma}</div></div>`
      : ''

    const aprobacionHtml = textoAprobacion
      ? `<div style="margin-top:12px;font-size:9px;color:#64748b;font-style:italic;">${textoAprobacion}</div>`
      : ''

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', Arial, sans-serif; background: #fff; color: #0f172a; padding: 32px; font-size: 12px; }
  table { border-collapse: collapse; width: 100%; }
</style>
</head>
<body>
  <!-- Encabezado institución -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;">
    <div style="display:flex;align-items:center;gap:16px;">
      ${logoHtml}
      <div>
        <div style="font-size:15px;font-weight:700;color:${colorHeader};">${nombre_inst}</div>
        ${subtitulo ? `<div style="font-size:10px;color:#64748b;margin-top:2px;">${subtitulo}</div>` : ''}
        ${fechaHtml}
      </div>
    </div>
  </div>

  <!-- Línea divisoria -->
  <div style="height:2px;background:${colorPrimario};margin-bottom:16px;border-radius:1px;"></div>

  <!-- Título y datos del alumno -->
  <div style="margin-bottom:16px;">
    <div style="font-size:13px;font-weight:700;color:${colorPrimario};letter-spacing:0.05em;">${titulo}</div>
    <div style="margin-top:8px;font-size:11px;color:#374151;display:flex;gap:24px;">
      <span><strong>Alumno:</strong> ${nombreEstudiante}</span>
      <span><strong>Ciclo Lectivo:</strong> ${cicloNombre}</span>
    </div>
  </div>

  <!-- Tabla de calificaciones -->
  <table>
    <thead><tr>${encabezadoCols}</tr></thead>
    <tbody>${filasCols || '<tr><td colspan="99" style="text-align:center;padding:20px;color:#94a3b8;font-size:11px;">Sin calificaciones registradas</td></tr>'}</tbody>
  </table>

  ${aprobacionHtml}
  ${firmaHtml}
  ${pieHtml}
</body>
</html>`
  },
}
