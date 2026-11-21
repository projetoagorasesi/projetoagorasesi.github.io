"use client"

import { useState } from "react"

export default function AntesDepois({
  antes,
  depois,
  rotuloAntes,
  rotuloDepois,
  proporcao = 16 / 9,
}: {
  antes: string
  depois: string
  rotuloAntes: string
  rotuloDepois: string
  proporcao?: number
}) {
  const [pos, setPos] = useState(50)
  return (
    <div style={{ aspectRatio: String(proporcao) }} className="relative w-full overflow-hidden rounded-2xl shadow-2xl select-none bg-black">
      <img src={depois} alt={rotuloDepois} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={antes} alt={rotuloAntes} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="absolute top-0 bottom-0 w-px bg-white/90 pointer-events-none" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1f1f1f]/90 text-white flex items-center justify-center gap-2 shadow-xl text-lg">
          <i className="fas fa-chevron-left"></i>
          <i className="fas fa-chevron-right"></i>
        </div>
      </div>
      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-soil-brown/80 text-white text-xs sm:text-sm font-semibold">
        {rotuloAntes}
      </span>
      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-tech-teal/90 text-white text-xs sm:text-sm font-semibold">
        {rotuloDepois}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Comparar: ${rotuloAntes} e ${rotuloDepois}`}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
      />
    </div>
  )
}
