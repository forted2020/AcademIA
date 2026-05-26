// templates/actaExamen.template.js
// Template de la Planilla de Calificaciones (renombrada en Fase 4).
// El código de BD se mantiene como 'acta_examen' por compatibilidad.

import { datosMuestra } from './datosMuestra'

const DEFAULTS_GLOBALES = {
  nombre_institucion: 'Institución Educativa',
  subtitulo_institucion: '',
  color_primario: '#0369a1',
  color_encabezado: '#0f172a',
  logo_base64: null,
  logo_mime_type: 'image/png',
}

export const actaExamenTemplate = {
  codigo: 'acta_examen',
  nombre: 'Planilla de Calificaciones',
  descripcion: 'Planilla oficial de calificaciones por materia y curso',
  orientacion_default: 'landscape',

  campos: [
    {
      clave: 'titulo_documento',
      tipo: 'text',
      label: 'Título del documento',
      default: 'ACTA DE EXAMEN',
    },
    {
      clave: 'mostrar_columna_definitiva',
      tipo: 'boolean',
      label: 'Mostrar columna Nota Final',
      default: true,
    },
    {
      clave: 'mostrar_estadisticas',
      tipo: 'boolean',
      label: 'Mostrar resumen estadístico',
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
      clave: 'texto_legal',
      tipo: 'textarea',
      label: 'Texto legal del pie del acta',
      default: 'La presente acta tiene validez legal conforme a la normativa vigente.',
    },
    {
      clave: 'texto_firma',
      tipo: 'text',
      label: 'Línea de firma',
      default: '',
      placeholder: 'Ej: Firma del Docente — Sello',
    },
    {
      clave: 'orientacion',
      tipo: 'select',
      label: 'Orientación del PDF',
      default: 'landscape',
      opciones: [
        { value: 'portrait', label: 'Vertical (retrato)' },
        { value: 'landscape', label: 'Horizontal (apaisado)' },
      ],
    },
  ],

  datosMuestra: datosMuestra.acta_examen,

  generarHtml(configGlobal = {}, config = {}, datos = {}) {
    const g = { ...DEFAULTS_GLOBALES, ...configGlobal }
    const c = config

    const nombre_inst   = g.nombre_institucion || 'Institución Educativa'
    const subtitulo     = g.subtitulo_institucion || ''
    const colorPrimario = g.color_primario || '#0369a1'
    const colorHeader   = g.color_encabezado || '#0f172a'
    const logo          = g.logo_base64
    const logoMime      = g.logo_mime_type || 'image/png'

    const titulo            = c.titulo_documento ?? 'ACTA DE EXAMEN'
    const mostrarDefinitiva = c.mostrar_columna_definitiva !== '0' && c.mostrar_columna_definitiva !== false
    const mostrarStats      = c.mostrar_estadisticas !== '0' && c.mostrar_estadisticas !== false
    const mostrarLogo       = (c.mostrar_logo !== '0' && c.mostrar_logo !== false) && !!logo
    const mostrarFecha      = c.mostrar_fecha_emision !== '0' && c.mostrar_fecha_emision !== false
    const textoLegal        = c.texto_legal || 'La presente acta tiene validez legal conforme a la normativa vigente.'
    const textoFirma        = c.texto_firma || ''

    const { nombreMateria = 'Materia', nombreCurso = 'Curso', cicloNombre = 'Ciclo Lectivo', columnas = [], filas = [] } = datos

    const aprobados   = filas.filter(f => (f.definitiva ?? f.promedio ?? 0) >= 6).length
    const reprobados  = filas.length - aprobados
    const promedioGen = filas.length
      ? (filas.reduce((s, f) => s + (f.definitiva ?? f.promedio ?? 0), 0) / filas.length).toFixed(1)
      : '—'

    const statusColor = (nota) => {
      if (nota == null) return { bg: '#f1f5f9', color: '#64748b' }
      if (nota >= 6)   return { bg: '#dcfce7', color: '#166534' }
      if (nota >= 4)   return { bg: '#fef9c3', color: '#92400e' }
      return            { bg: '#fee2e2', color: '#991b1b' }
    }

    const encabezadoCols = [
      `<th style="text-align:left;padding:7px 10px;background:${colorPrimario};color:#fff;font-weight:600;font-size:10px;border:none;min-width:160px;">Estudiante</th>`,
      ...columnas.map(col => `<th style="text-align:center;padding:7px 8px;background:${colorPrimario};color:#fff;font-weight:600;font-size:10px;border:none;">${col.label}</th>`),
      `<th style="text-align:center;padding:7px 8px;background:${colorPrimario};color:#fff;font-weight:600;font-size:10px;border:none;">Promedio</th>`,
      mostrarDefinitiva ? `<th style="text-align:center;padding:7px 8px;background:${colorPrimario};color:#fff;font-weight:600;font-size:10px;border:none;">Nota Final</th>` : '',
    ].join('')

    const filasCols = filas.map((fila, i) => {
      const bg     = i % 2 === 0 ? '#fff' : '#f5f9fc'
      const nota   = fila.definitiva ?? fila.promedio
      const st     = statusColor(nota)
      const badge  = nota != null
        ? `<span style="display:inline-block;padding:2px 8px;border-radius:12px;font-weight:700;font-size:10px;background:${st.bg};color:${st.color};">${nota}</span>`
        : '<span style="color:#94a3b8;">—</span>'
      const promBadge = fila.promedio != null
        ? `<span style="font-size:10px;color:#374151;">${fila.promedio}</span>`
        : '<span style="color:#94a3b8;">—</span>'
      return `
        <tr style="background:${bg};">
          <td style="padding:6px 10px;font-size:10px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${fila.nombre_completo}</td>
          ${columnas.map(col => `<td style="text-align:center;padding:6px 8px;font-size:10px;border-bottom:1px solid #e2e8f0;color:#374151;">${fila.calificaciones[col.id_tipo_nota] != null ? fila.calificaciones[col.id_tipo_nota] : '<span style="color:#94a3b8;">—</span>'}</td>`).join('')}
          <td style="text-align:center;padding:6px 8px;border-bottom:1px solid #e2e8f0;">${promBadge}</td>
          ${mostrarDefinitiva ? `<td style="text-align:center;padding:6px 8px;border-bottom:1px solid #e2e8f0;">${badge}</td>` : ''}
        </tr>`
    }).join('')

    const logoHtml  = mostrarLogo ? `<img src="data:${logoMime};base64,${logo}" style="max-height:50px;max-width:100px;object-fit:contain;" alt="Logo" />` : ''
    const fechaHtml = mostrarFecha ? `<div style="font-size:9px;color:#64748b;margin-top:4px;">Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}</div>` : ''

    const statsHtml = mostrarStats ? `
      <div style="margin-top:16px;display:flex;gap:16px;">
        <div style="padding:8px 16px;background:#f0f9ff;border-radius:8px;text-align:center;">
          <div style="font-size:18px;font-weight:700;color:${colorPrimario};">${filas.length}</div>
          <div style="font-size:9px;color:#64748b;margin-top:2px;">Total estudiantes</div>
        </div>
        <div style="padding:8px 16px;background:#dcfce7;border-radius:8px;text-align:center;">
          <div style="font-size:18px;font-weight:700;color:#166534;">${aprobados}</div>
          <div style="font-size:9px;color:#166534;margin-top:2px;">Aprobados</div>
        </div>
        <div style="padding:8px 16px;background:#fee2e2;border-radius:8px;text-align:center;">
          <div style="font-size:18px;font-weight:700;color:#991b1b;">${reprobados}</div>
          <div style="font-size:9px;color:#991b1b;margin-top:2px;">Reprobados</div>
        </div>
        <div style="padding:8px 16px;background:#f1f5f9;border-radius:8px;text-align:center;">
          <div style="font-size:18px;font-weight:700;color:#0f172a;">${promedioGen}</div>
          <div style="font-size:9px;color:#64748b;margin-top:2px;">Promedio general</div>
        </div>
      </div>` : ''

    const firmaHtml = textoFirma
      ? `<div style="margin-top:32px;text-align:right;"><div style="display:inline-block;border-top:1px solid #0f172a;padding-top:6px;font-size:10px;color:#374151;min-width:200px;">${textoFirma}</div></div>`
      : ''

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', Arial, sans-serif; background: #fff; color: #0f172a; padding: 28px; font-size: 11px; }
  table { border-collapse: collapse; width: 100%; }
</style>
</head>
<body>
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;">
    <div style="display:flex;align-items:center;gap:14px;">
      ${logoHtml}
      <div>
        <div style="font-size:14px;font-weight:700;color:${colorHeader};">${nombre_inst}</div>
        ${subtitulo ? `<div style="font-size:9px;color:#64748b;margin-top:2px;">${subtitulo}</div>` : ''}
        ${fechaHtml}
      </div>
    </div>
  </div>

  <div style="height:2px;background:${colorPrimario};margin-bottom:14px;border-radius:1px;"></div>

  <div style="margin-bottom:14px;">
    <div style="font-size:12px;font-weight:700;color:${colorPrimario};letter-spacing:0.05em;">${titulo}</div>
    <div style="margin-top:6px;font-size:10px;color:#374151;display:flex;gap:20px;flex-wrap:wrap;">
      <span><strong>Materia:</strong> ${nombreMateria}</span>
      <span><strong>Curso:</strong> ${nombreCurso}</span>
      <span><strong>Ciclo:</strong> ${cicloNombre}</span>
    </div>
  </div>

  <table>
    <thead><tr>${encabezadoCols}</tr></thead>
    <tbody>${filasCols || '<tr><td colspan="99" style="text-align:center;padding:20px;color:#94a3b8;font-size:10px;">Sin estudiantes registrados</td></tr>'}</tbody>
  </table>

  ${statsHtml}
  ${firmaHtml}

  <div style="margin-top:20px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:9px;color:#64748b;font-style:italic;">${textoLegal}</div>
</body>
</html>`
  },
}
