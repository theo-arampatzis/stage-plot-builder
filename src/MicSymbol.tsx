type MicSymbolProps = {
  x: number;
  y: number;
  label?: string;
};

export default function MicSymbol({ x, y, label }: MicSymbolProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-5} y={-14} width={10} height={18} rx={5} fill="#334155" />
      <line x1={0} y1={4} x2={0} y2={12} stroke="#334155" strokeWidth={2} />
      {label !== undefined && (
        <text x={0} y={30} textAnchor="middle" fontSize={14} fill="#334155">
          {label}
        </text>
      )}
    </g>
  );
}
