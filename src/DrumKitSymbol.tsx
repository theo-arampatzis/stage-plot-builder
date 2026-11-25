type DrumKitSymbolProps = {
  x: number;
  y: number;
  label: string;
};

export default function DrumKitSymbol({ x, y, label }: DrumKitSymbolProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g fill="none" stroke="#334155" strokeWidth={2}>
        <circle cx={0} cy={-7} r={12} />
        <circle cx={-8} cy={11} r={5} />
        <circle cx={8} cy={11} r={5} />
        <circle cx={-22} cy={-4} r={6} />
        <circle cx={22} cy={-4} r={6} />
        <circle cx={-23} cy={15} r={7} />
        <circle cx={23} cy={15} r={7} />
      </g>
      <text x={0} y={36} textAnchor="middle" fontSize={14} fill="#334155">
        {label}
      </text>
    </g>
  );
}
