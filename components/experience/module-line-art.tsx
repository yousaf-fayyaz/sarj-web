import { useId, type CSSProperties } from "react";
import type { ModuleSubject } from "@/lib/module-shapes";

const diagrams: Record<ModuleSubject, { outline: string; flow: string; nodes: [number, number][] }> = {
  payroll: {
    outline: "M114 28h92v66h-92z M124 44h27 M124 55h44 M124 66h33 M185 42v31 M180 47h10 M180 67h10 M36 52h38v27H36z M246 52h38v27h-38z M44 62h22 M44 69h14 M254 62h22 M254 69h14",
    flow: "M0 66h36 M74 66h22q10 0 10-10V44q0-10 10-10 M206 60h40 M284 66h36 M160 94v18h-44 M160 112h46",
    nodes: [[36, 66], [246, 60], [160, 112]],
  },
  attendance: {
    outline: "M119 66c0-22 18-40 41-40s41 18 41 40 M129 70c0-18 13-32 31-32s31 14 31 32 M140 73c0-13 8-23 20-23s20 10 20 23c0 18-5 33-13 43 M150 77c0-8 3-14 10-14s10 6 10 14c0 13-3 25-8 34 M160 77c0 18-5 31-12 40 M130 83c0 12-3 22-8 29 M190 83c-1 15-4 27-10 36 M55 38v56 M45 48h20 M45 84h20 M265 38v56 M255 48h20 M255 84h20",
    flow: "M0 66h90q13 0 13 13v18 M217 97V79q0-13 13-13h90 M102 26h26 M192 26h26",
    nodes: [[55, 66], [265, 66], [103, 97]],
  },
  leave: {
    outline: "M113 32h94v78h-94z M113 51h94 M134 24v16 M186 24v16 M128 65h8 M149 65h8 M170 65h8 M191 65h3 M128 83h8 M149 83h8 M170 83h8 M191 83h3 M128 99h8 M149 99h8 M169 94l5 5 10-11 M38 57h35v27H38z M249 57h35v27h-35z",
    flow: "M0 70h38 M73 70h40 M207 70h42 M284 70h36 M160 110v16h58",
    nodes: [[38, 70], [249, 70], [160, 126]],
  },
  "self-service": {
    outline: "M135 18h50q7 0 7 7v88q0 7-7 7h-50q-7 0-7-7V25q0-7 7-7z M150 26h20 M151 112h18 M153 51a7 7 0 1 0 14 0a7 7 0 1 0-14 0 M146 73c0-16 28-16 28 0 M142 86l4 4 7-7 M159 87h18 M142 100l4 4 7-7 M159 101h18 M48 42h44v27H48z M228 80h44v27h-44z",
    flow: "M0 55h48 M92 55h36 M192 93h36 M272 93h48 M217 44h37v20 M66 88v20h42",
    nodes: [[128, 55], [228, 93], [254, 64]],
  },
  performance: {
    outline: "M105 112h112 M118 112V84h18v28 M151 112V65h18v47 M184 112V40h18v72 M110 66l40-28 31 8 28-28 M197 18h12v12 M37 65h38v28H37z M250 40h33v26h-33z",
    flow: "M0 79h37 M75 79h20 M217 53h33 M283 53h37 M160 124h58",
    nodes: [[37, 79], [250, 53], [160, 124]],
  },
  "employee-files": {
    outline: "M123 26h59l21 21v66h-80z M182 26v21h21 M135 62h18 M135 74h55 M135 86h55 M135 98h36 M135 26V16h60l20 21v67 M143 16V6h60l20 21v67 M40 62h34v26H40z M247 64h34v26h-34z M254 78l5 5 10-12",
    flow: "M0 75h40 M74 75h49 M203 77h44 M281 77h39 M162 113v15h-54",
    nodes: [[40, 75], [247, 77], [162, 128]],
  },
};

/** Module schematics suspended inside a moving signal field. */
export function ModuleLineArt({ subject, index = 0 }: { subject: ModuleSubject; index?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const diagram = diagrams[subject];
  return (
    <div className={`module-line-art line-art-${subject}`} style={{ "--signal-delay": `${index * -0.7}s` } as CSSProperties} aria-hidden="true">
      <svg viewBox="0 0 320 136" fill="none" focusable="false">
        <defs>
          <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0v20" stroke="currentColor" strokeOpacity=".07" strokeWidth=".6" />
          </pattern>
          <filter id={`${id}-light`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <radialGradient id={`${id}-core`}>
            <stop stopColor="currentColor" stopOpacity=".22" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="136" fill={`url(#${id}-grid)`} />
        <circle className="line-art-core" cx="160" cy="68" r="64" fill={`url(#${id}-core)`} />
        <g className="line-art-orbit" stroke="currentColor" strokeWidth=".7">
          <ellipse cx="160" cy="68" rx="62" ry="49" strokeOpacity=".25" />
          <ellipse cx="160" cy="68" rx="62" ry="49" strokeDasharray="12 72" strokeOpacity=".7" />
          <circle cx="98" cy="68" r="3" fill="currentColor" stroke="none" />
          <circle cx="222" cy="68" r="2.5" fill="#f0ffdf" stroke="none" />
        </g>
        <g className="line-art-orbit line-art-orbit-reverse" stroke="currentColor" strokeWidth=".6">
          <ellipse cx="160" cy="68" rx="58" ry="57" strokeOpacity=".16" strokeDasharray="2 7" />
          <circle cx="160" cy="11" r="2" fill="currentColor" stroke="none" />
        </g>
        <path className="line-art-scan" d="M24 68h272" stroke="currentColor" strokeOpacity=".6" strokeWidth="1" />
        <g stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
          <path className="line-art-outline" d={diagram.outline} />
          <path className="line-art-route" d={diagram.flow} pathLength="100" />
          <path className="line-art-signal line-art-halo" d={diagram.flow} pathLength="100" filter={`url(#${id}-light)`} />
          <path className="line-art-signal" d={diagram.flow} pathLength="100" />
        </g>
        {diagram.nodes.map(([x, y], i) => (
          <g key={`${x}-${y}`}>
            <circle className="line-art-node-halo" cx={x} cy={y} r="6" style={{ animationDelay: `${-i - index}s` }} />
            <circle cx={x} cy={y} r="2" fill="currentColor" />
          </g>
        ))}
      </svg>
    </div>
  );
}
