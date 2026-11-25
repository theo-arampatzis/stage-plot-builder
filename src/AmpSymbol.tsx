type AmpSymbolProps = {
  x: number;
  y: number;
  label: string;
};

export default function AmpSymbol({ x, y, label }: AmpSymbolProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-20} y={-12} width={40} height={24} rx={3} fill="#334155" />
      <line x1={-15} y1={-5} x2={15} y2={-5} stroke="#f1f5f9" strokeWidth={2} />
      <text x={0} y={28} textAnchor="middle" fontSize={14} fill="#334155">
        {label}
      </text>
    </g>
  );
}
