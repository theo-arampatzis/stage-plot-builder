type MonitorSymbolProps = {
  x: number;
  y: number;
  label: string;
};

export default function MonitorSymbol({ x, y, label }: MonitorSymbolProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon points="-18,-8 18,-8 23,8 -23,8" fill="#334155" />
      <text x={0} y={17} textAnchor="middle" fontSize={14} fill="#334155">
        {label}
      </text>
    </g>
  );
}
