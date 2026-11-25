import { useState } from "react";
import AmpSymbol from "./AmpSymbol";
import DrumKitSymbol from "./DrumKitSymbol";
import MicSymbol from "./MicSymbol";
import MonitorSymbol from "./MonitorSymbol";
import "./App.css";

const equipmentKinds = ["mic", "monitor", "amp", "drums"] as const;

type StageItem = {
  id: string;
  kind: (typeof equipmentKinds)[number];
  x: number;
  y: number;
  label: string;
};

const initialStageItems: StageItem[] = [
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

const equipmentDefaults = {
  mic: { name: "Microphone", x: 300, y: 210 },
  monitor: { name: "Monitor", x: 450, y: 200 },
  amp: { name: "Amplifier", x: 150, y: 185 },
  drums: { name: "Drum kit", x: 300, y: 150 },
} satisfies Record<StageItem["kind"], { name: string; x: number; y: number }>;

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageItems, setStageItems] = useState<StageItem[]>(initialStageItems);
  const selectedItem = stageItems.find((item) => item.id === selectedId);

  function addEquipment(kind: StageItem["kind"]) {
    const { name, x, y } = equipmentDefaults[kind];
    const item: StageItem = {
      id: crypto.randomUUID(),
      kind,
      x,
      y,
      label: `New ${name.toLowerCase()}`,
    };

    setStageItems((items) => [...items, item]);
    setSelectedId(item.id);
  }

  return (
    <main className="stage-layout">
      <aside className="equipment-palette" aria-labelledby="equipment-heading">
        <h2 id="equipment-heading">Equipment</h2>
        <div className="equipment-buttons">
          {equipmentKinds.map((kind) => {
            const Symbol = stageSymbols[kind];

            return (
              <button
                key={kind}
                type="button"
                onClick={() => addEquipment(kind)}
              >
                <svg viewBox="-36 -24 72 48" aria-hidden="true">
                  <Symbol x={0} y={0} />
                </svg>
                {equipmentDefaults[kind].name}
              </button>
            );
          })}
        </div>
      </aside>
      <div>
        <svg className="stage-canvas" viewBox="0 0 600 400">
          <rect
            x={20}
            y={20}
            width={560}
            height={320}
            fill="#f1f5f9"
            stroke="#334155"
            onClick={() => setSelectedId(null)}
          />
          <text x={300} y={375} textAnchor="middle" fill="#334155">
            Audience / Front of Stage
          </text>

          {stageItems.map(({ id, kind, x, y, label }) => {
            const Symbol = stageSymbols[kind];

            return (
              <g
                key={id}
                onClick={() => setSelectedId(id)}
                style={{ cursor: "pointer" }}
              >
                {selectedId === id && (
                  <circle
                    cx={x}
                    cy={y}
                    r={32}
                    fill="#dbeafe"
                    pointerEvents="none"
                  />
                )}
                <Symbol x={x} y={y} label={label} />
              </g>
            );
          })}
        </svg>
        {selectedItem && (
          <label className="equipment-label">
            Equipment label
            <input
              value={selectedItem.label}
              onChange={(event) => {
                const label = event.currentTarget.value;

                setStageItems((items) =>
                  items.map((item) =>
                    item.id === selectedItem.id ? { ...item, label } : item,
                  ),
                );
              }}
            />
          </label>
        )}
      </div>
    </main>
  );
}
