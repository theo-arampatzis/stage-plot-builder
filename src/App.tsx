import AmpSymbol from "./AmpSymbol";
import DrumKitSymbol from "./DrumKitSymbol";
import MicSymbol from "./MicSymbol";
import MonitorSymbol from "./MonitorSymbol";

type StageItem = {
  id: string;
  kind: "mic" | "monitor" | "amp" | "drums";
  x: number;
  y: number;
  label: string;
};

const stageItems: StageItem[] = [
  { id: "lead-vocal", kind: "mic", x: 300, y: 270, label: "Lead vocal" },
  { id: "backing-vocal", kind: "mic", x: 150, y: 240, label: "Backing vocal" },
  {
    id: "vocal-monitor",
    kind: "monitor",
    x: 300,
    y: 320,
    label: "Vocal monitor",
  },
  {
    id: "backing-monitor",
    kind: "monitor",
    x: 150,
    y: 300,
    label: "Backing monitor",
  },
  { id: "guitar-amp", kind: "amp", x: 150, y: 130, label: "Guitar amp" },
  { id: "drum-kit", kind: "drums", x: 300, y: 85, label: "Drum kit" },
  { id: "bass-amp", kind: "amp", x: 450, y: 130, label: "Bass amp" },
  {
    id: "bass-monitor",
    kind: "monitor",
    x: 450,
    y: 300,
    label: "Bass monitor",
  },
];

const stageSymbols = {
  mic: MicSymbol,
  monitor: MonitorSymbol,
  amp: AmpSymbol,
  drums: DrumKitSymbol,
} satisfies Record<StageItem["kind"], typeof MicSymbol>;

export default function App() {
  return (
    <svg
      viewBox="0 0 600 400"
      style={{ display: "block", width: "100%", maxWidth: 600 }}
    >
      <rect
        x={20}
        y={20}
        width={560}
        height={320}
        fill="#f1f5f9"
        stroke="#334155"
      />
      <text x={300} y={375} textAnchor="middle" fill="#334155">
        Audience / Front of Stage
      </text>

      {stageItems.map(({ id, kind, x, y, label }) => {
        const Symbol = stageSymbols[kind];

        return <Symbol key={id} x={x} y={y} label={label} />;
      })}
    </svg>
  );
}
