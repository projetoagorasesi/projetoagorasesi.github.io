"use client"

import { useState } from "react"

export default function AntesDepois({
  antes,
  depois,
  rotuloAntes,
  rotuloDepois,
}: {
  antes: string
  depois: string
  rotuloAntes: string
  rotuloDepois: string
}) {
  const [pos, setPos] = useState(50)
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-2xl select-none bg-black">
      <img src={depois} alt={rotuloDepois} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={antes} alt={rotuloAntes} className="absolute inset-0 w-full h-full object-cover grayscale" />
      </div>
      <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-12 h-12 rounded-full bg-white text-soil-brown flex items-center justify-center shadow-xl">
          <i className="fas fa-arrows-left-right"></i>
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
        aria-label="Comparar 1940 e 2015"
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
      />
    </div>
  )
}
