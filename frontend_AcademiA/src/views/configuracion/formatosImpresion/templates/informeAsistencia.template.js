// templates/informeAsistencia.template.js
// Template de Informe de Asistencia por estudiante y año.

import { datosMuestra } from './datosMuestra'

const DEFAULTS_GLOBALES = {
  nombre_institucion: 'Institución Educativa',
  subtitulo_institucion: '',
  color_primario: '#0369a1',
  color_encabezado: '#0f172a',
  logo_base64: null,
  logo_mime_type: 'image/png',
}

export const informeAsistenciaTemplate = {
  codigo: 'informe_asistencia',
  nombre: 'Informe de Asistencia',
  descripcion: 'Registro de presencia y ausencias por estudiante y año',
  orientacion_default: 'portrait',

  campos: [
    {
      clave: 'titulo_documento',
      tipo: 'text',
      label: 'Título del documento',
      default: 'INFORME DE ASISTENCIA',
    },
    {
      clave: 'mostrar_resumen_porcentual',
      tipo: 'boolean',
      label: 'Mostrar tarjetas de resumen',
      default: true,
    },
    {
      clave: 'mostrar_detalle_por_materia',
      tipo: 'boolean',
      label: 'Mostrar detalle de inasistencias',
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
      placeholder: 'Ej: Preceptoría — Secretaría',
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

  datosMuestra: datosMuestra.informe_asistencia,

  generarHtml(configGlobal = {}, config = {}, datos = {}) {
    const g = { ...DEFAULTS_GLOBALES, ...configGlobal }
    const c = config

    const nombre_inst   = g.nombre_institucion || 'Institución Educativa'
    const subtitulo     = g.subtitulo_institucion || ''
    const colorPrimario = g.color_primario || '#0369a1'
    const colorHeader   = g.color_encabezado || '#0f172a'
    const logo          = g.logo_base64
    const logoMime      = g.logo_mime_type || 'image/png'

    const titulo           = c.titulo_documento ?? 'INFORME DE ASISTENCIA'
    const mostrarResumen   = c.mostrar_resumen_porcentual !== '0' && c.mostrar_resumen_porcentual !== false
    const mostrarDetalle   = c.mostrar_detalle_por_materia !== '0' && c.mostrar_detalle_por_materia !== false
    const mostrarLogo      = (c.mostrar_logo !== '0' && c.mostrar_logo !== false) && !!logo
    const mostrarFecha     = c.mostrar_fecha_emision !== '0' && c.mostrar_fecha_emision !== false
    const textoPie         = c.texto_pie || g.texto_pie_global || ''
    const textoFirma       = c.texto_firma || ''

    const {
      nombreEstudiante = 'Apellido, Nombre',
      anio = new Date().getFullYear(),
      resumen = { total: 0, justificadas: 0, injustificadas: 0 },
      detalle = [],
    } = datos

    const logoHtml  = mostrarLogo ? `<img src="data:${logoMime};base64,${logo}" style="max-height:56px;max-width:110px;object-fit:contain;" alt="Logo" />` : ''
    const fechaHtml = mostrarFecha ? `<div style="font-size:9px;color:#64748b;margin-top:4px;">Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}</div>` : ''

    const alerta = resumen.total >= 15
      ? `<div style="margin-top:12px;padding:8px 12px;background:#fee2e2;border-left:3px solid #ef4444;border-radius:4px;font-size:10px;color:#991b1b;">⚠️ El estudiante supera las 15 inasistencias. Se recomienda notificar a la familia.</div>`
      : ''

    const resumenHtml = mostrarResumen ? `
      <div style="display:flex;gap:12px;margin-top:16px;">
        <div style="flex:1;padding:10px 14px;background:#f0f9ff;border-radius:8px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:${colorPrimario};">${resumen.total}</div>
          <div style="font-size:9px;color:#64748b;margin-top:2px;">Total inasistencias</div>
        </div>
        <div style="flex:1;padding:10px 14px;background:#dcfce7;border-radius:8px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#166534;">${resumen.justificadas}</div>
          <div style="font-size:9px;color:#166534;margin-top:2px;">Justificadas</div>
        </div>
        <div style="flex:1;padding:10px 14px;background:#fee2e2;border-radius:8px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#991b1b;">${resumen.injustificadas}</div>
          <div style="font-size:9px;color:#991b1b;margin-top:2px;">Injustificadas</div>
        </div>
      </div>
      ${alerta}` : ''

    const formatFecha = (f) => {
      if (!f) return '—'
      const d = new Date(f + 'T00:00:00')
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
    }

    const detalleHtml = mostrarDetalle ? `
      <div style="margin-top:20px;">
        <div style="font-size:11px;font-weight:600;color:${colorHeader};margin-bottom:8px;">Detalle de inasistencias</div>
        <table style="border-collapse:collapse;width:100%;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px 8px;background:${colorPrimario};color:#fff;font-size:10px;font-weight:600;border:none;">Fecha</th>
              <th style="text-align:left;padding:6px 8px;background:${colorPrimario};color:#fff;font-size:10px;font-weight:600;border:none;">Tipo</th>
              <th style="text-align:center;padding:6px 8px;background:${colorPrimario};color:#fff;font-size:10px;font-weight:600;border:none;">Valor</th>
              <th style="text-align:center;padding:6px 8px;background:${colorPrimario};color:#fff;font-size:10px;font-weight:600;border:none;">Justificada</th>
              <th style="text-align:left;padding:6px 8px;background:${colorPrimario};color:#fff;font-size:10px;font-weight:600;border:none;">Motivo</th>
            </tr>
          </thead>
          <tbody>
            ${detalle.map((row, i) => `
              <tr style="background:${i % 2 === 0 ? '#fff' : '#f5f9fc'};">
                <td style="padding:5px 8px;font-size:10px;border-bottom:1px solid #e2e8f0;">${formatFecha(row.fecha)}</td>
                <td style="padding:5px 8px;font-size:10px;border-bottom:1px solid #e2e8f0;">${row.tipo || '—'}</td>
                <td style="text-align:center;padding:5px 8px;font-size:10px;border-bottom:1px solid #e2e8f0;">${row.valor ?? '—'}</td>
                <td style="text-align:center;padding:5px 8px;border-bottom:1px solid #e2e8f0;">
                  <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:600;background:${row.justificada ? '#dcfce7' : '#fee2e2'};color:${row.justificada ? '#166534' : '#991b1b'};">
                    ${row.justificada ? 'Sí' : 'No'}
                  </span>
                </td>
                <td style="padding:5px 8px;font-size:10px;border-bottom:1px solid #e2e8f0;color:#64748b;">${row.motivo || '—'}</td>
              </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;font-size:10px;">Sin inasistencias registradas</td></tr>'}
          </tbody>
        </table>
      </div>` : ''

    const firmaHtml = textoFirma
      ? `<div style="margin-top:32px;text-align:center;"><div style="display:inline-block;border-top:1px solid #0f172a;padding-top:6px;font-size:10px;color:#374151;min-width:200px;">${textoFirma}</div></div>`
      : ''

    const pieHtml = textoPie
      ? `<div style="margin-top:24px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:9px;color:#64748b;text-align:center;">${textoPie}</div>`
      : ''

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', Arial, sans-serif; background: #fff; color: #0f172a; padding: 32px; font-size: 12px; }
  table { border-collapse: collapse; width: 100%; }
</style>
</head>
<body>
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

  <div style="height:2px;background:${colorPrimario};margin-bottom:16px;border-radius:1px;"></div>

  <div style="margin-bottom:4px;">
    <div style="font-size:13px;font-weight:700;color:${colorPrimario};letter-spacing:0.05em;">${titulo}</div>
    <div style="margin-top:8px;font-size:11px;color:#374151;display:flex;gap:24px;">
      <span><strong>Estudiante:</strong> ${nombreEstudiante}</span>
      <span><strong>Año:</strong> ${anio}</span>
    </div>
  </div>

  ${resumenHtml}
  ${detalleHtml}
  ${firmaHtml}
  ${pieHtml}
</body>
</html>`
  },
}
