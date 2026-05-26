// components/barChart/BarChart.jsx
// Gráfico de barras horizontales con divs — sin dependencias de charting.
// Cada barra se dibuja como un div con width % animado en CSS.

import React from 'react'
import './BarChart.css'

// data: Array<{ label: string, value: number, color?: string }>
// color: color CSS por defecto para todas las barras
export default function BarChart({ data = [], color = 'var(--acad-blue, #0369a1)' }) {
  if (!data.length) return null

  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="bar-chart">
      {data.map((d) => {
        const pct = (d.value / max) * 100
        return (
          <div key={d.label} className="bar-chart__row">
            <span className="bar-chart__label">{d.label}</span>
            <div className="bar-chart__track">
              <div
                className="bar-chart__fill"
                style={{
                  width: pct + '%',
                  background: d.color || color,
                }}
              />
            </div>
            <span className="bar-chart__value">{d.value}</span>
          </div>
        )
      })}
    </div>
  )
}
