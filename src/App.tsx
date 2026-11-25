import { useRef, useState, type DragEvent, type MouseEvent, type PointerEvent } from "react";
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

type StagePosition = Pick<StageItem, "x" | "y">;

type EquipmentPointerDrag = {
  pointerId: number;
  equipment: Pick<StageItem, "kind"> | StageItem;
  offset: StagePosition;
  startX: number;
  startY: number;
  moved: boolean;
};

type DragPreview = StagePosition & {
  equipment: EquipmentPointerDrag["equipment"];
  scale: number;
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

const equipmentDragType = "application/x-stage-plot-equipment";
const stageBounds = { x: 20, y: 20, width: 560, height: 320 };
const dragThreshold = 5;

function getSvgPosition(
  screenMatrix: DOMMatrix,
  clientX: number,
  clientY: number,
): StagePosition | null {
  const { x, y } = new DOMPoint(clientX, clientY).matrixTransform(
    screenMatrix.inverse(),
  );

  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

function isInsideStage({ x, y }: StagePosition) {
  return (
    x >= stageBounds.x &&
    x <= stageBounds.x + stageBounds.width &&
    y >= stageBounds.y &&
    y <= stageBounds.y + stageBounds.height
  );
}

function getStageDropPosition(event: DragEvent<SVGSVGElement>) {
  const screenMatrix = event.currentTarget.getScreenCTM();
  if (!screenMatrix) return null;

  const point = getSvgPosition(screenMatrix, event.clientX, event.clientY);
  return point && isInsideStage(point) ? point : null;
}

function getEquipmentPosition(pointer: StagePosition, offset: StagePosition) {
  const x = pointer.x + offset.x;
  const y = pointer.y + offset.y;

  if (!isInsideStage(pointer)) return { x, y };

  return {
    x: Math.min(stageBounds.x + stageBounds.width, Math.max(stageBounds.x, x)),
    y: Math.min(stageBounds.y + stageBounds.height, Math.max(stageBounds.y, y)),
  };
}

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageItems, setStageItems] = useState<StageItem[]>(initialStageItems);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const stage = useRef<SVGSVGElement>(null);
  const activePaletteDrag = useRef<StageItem["kind"] | null>(null);
  const equipmentPointer = useRef<EquipmentPointerDrag | null>(null);
  const suppressPointerClick = useRef(false);
  const selectedItem = stageItems.find((item) => item.id === selectedId);
  const draggedEquipment = dragPreview?.equipment;
  const draggedId = draggedEquipment && "id" in draggedEquipment ? draggedEquipment.id : null;
  const DragSymbol = draggedEquipment ? stageSymbols[draggedEquipment.kind] : null;

  function addEquipment(kind: StageItem["kind"], position?: StagePosition) {
    const defaults = equipmentDefaults[kind];
    const { x, y } = position ?? defaults;
    const item: StageItem = {
      id: crypto.randomUUID(),
      kind,
      x,
      y,
      label: `New ${defaults.name.toLowerCase()}`,
    };

    setStageItems((items) => [...items, item]);
    setSelectedId(item.id);
  }

  function startEquipmentDrag(
    event: DragEvent<HTMLButtonElement>,
    kind: StageItem["kind"],
  ) {
    // Pointer capture handles direct gestures without starting an OS drag.
    if (equipmentPointer.current !== null) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(equipmentDragType, kind);
    activePaletteDrag.current = kind;
  }

  function allowStageDrop(event: DragEvent<SVGSVGElement>) {
    if (
      activePaletteDrag.current !== null &&
      event.dataTransfer.types.includes(equipmentDragType) &&
      getStageDropPosition(event)
    ) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }
  }

  function dropEquipment(event: DragEvent<SVGSVGElement>) {
    const kind = activePaletteDrag.current;
    if (kind === null || event.dataTransfer.getData(equipmentDragType) !== kind) {
      return;
    }

    const position = getStageDropPosition(event);
    if (!position) return;

    event.preventDefault();
    activePaletteDrag.current = null;
    addEquipment(kind, position);
  }

  function startEquipmentPointer(
    event: PointerEvent,
    equipment: EquipmentPointerDrag["equipment"],
  ) {
    if (!event.isPrimary || event.button !== 0 || equipmentPointer.current) return;

    let offset = { x: 0, y: 0 };
    if ("id" in equipment) {
      const screenMatrix = stage.current?.getScreenCTM();
      if (!screenMatrix) return;

      const point = getSvgPosition(screenMatrix, event.clientX, event.clientY);
      if (!point) return;

      offset = { x: equipment.x - point.x, y: equipment.y - point.y };
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    suppressPointerClick.current = false;
    equipmentPointer.current = {
      pointerId: event.pointerId,
      equipment,
      offset,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  }

  function moveEquipmentPointer(event: PointerEvent) {
    const gesture = equipmentPointer.current;
    if (gesture?.pointerId !== event.pointerId) return;

    const distance = Math.hypot(
      event.clientX - gesture.startX,
      event.clientY - gesture.startY,
    );
    if (!gesture.moved && distance < dragThreshold) return;

    gesture.moved = true;
    const screenMatrix = stage.current?.getScreenCTM();
    if (!screenMatrix) return;

    const point = getSvgPosition(screenMatrix, event.clientX, event.clientY);
    if (!point) return;

    const position = getEquipmentPosition(point, gesture.offset);
    const { x, y } = new DOMPoint(position.x, position.y).matrixTransform(screenMatrix);
    setDragPreview({
      x,
      y,
      scale: Math.hypot(screenMatrix.a, screenMatrix.b),
      equipment: gesture.equipment,
    });
  }

  function finishEquipmentPointer(event: PointerEvent) {
    const gesture = equipmentPointer.current;
    if (gesture?.pointerId !== event.pointerId) return;

    equipmentPointer.current = null;
    setDragPreview(null);
    const releaseTarget = document.elementFromPoint(event.clientX, event.clientY);
    suppressPointerClick.current =
      gesture.moved || !event.currentTarget.contains(releaseTarget);
    if (!gesture.moved) return;

    const screenMatrix = stage.current?.getScreenCTM();
    if (!screenMatrix) return;

    const point = getSvgPosition(screenMatrix, event.clientX, event.clientY);
    if (!point) return;

    const { equipment, offset } = gesture;
    const inside = isInsideStage(point);
    if ("id" in equipment) {
      if (!inside) {
        setStageItems((items) => items.filter((item) => item.id !== equipment.id));
        setSelectedId((id) => (id === equipment.id ? null : id));
        return;
      }

      const position = getEquipmentPosition(point, offset);
      setStageItems((items) =>
        items.map((item) => (item.id === equipment.id ? { ...item, ...position } : item)),
      );
      setSelectedId(equipment.id);
    } else if (inside) {
      addEquipment(equipment.kind, point);
    }
  }

  function cancelEquipmentPointer(event: PointerEvent) {
    if (equipmentPointer.current?.pointerId !== event.pointerId) return;

    suppressPointerClick.current = equipmentPointer.current.moved;
    equipmentPointer.current = null;
    setDragPreview(null);
  }

  function isEquipmentClick(event: MouseEvent) {
    const activate = event.detail === 0 || !suppressPointerClick.current;
    suppressPointerClick.current = false;
    return activate;
  }

  const equipmentPointerHandlers = {
    onPointerMove: moveEquipmentPointer,
    onPointerUp: finishEquipmentPointer,
    onPointerCancel: cancelEquipmentPointer,
    onLostPointerCapture: cancelEquipmentPointer,
  };

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
                draggable
                style={{ touchAction: "none", userSelect: "none" }}
                onClick={(event) => {
                  if (isEquipmentClick(event)) addEquipment(kind);
                }}
                onPointerDown={(event) => startEquipmentPointer(event, { kind })}
                {...equipmentPointerHandlers}
                onDragStart={(event) => startEquipmentDrag(event, kind)}
                onDragEnd={() => {
                  activePaletteDrag.current = null;
                }}
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
        <svg
          ref={stage}
          className="stage-canvas"
          viewBox="0 0 600 400"
          onDragOver={allowStageDrop}
          onDrop={dropEquipment}
        >
          <rect
            {...stageBounds}
            fill="#f1f5f9"
            stroke="#334155"
            onClick={() => setSelectedId(null)}
          />
          <text x={300} y={375} textAnchor="middle" fill="#334155">
            Audience / Front of Stage
          </text>
          {stageItems.map((item) => {
            const { id, kind, x, y, label } = item;
            const Symbol = stageSymbols[kind];

            return (
              <g
                key={id}
                opacity={draggedId === id ? 0 : undefined}
                onClick={(event) => {
                  if (isEquipmentClick(event)) setSelectedId(id);
                }}
                onPointerDown={(event) => startEquipmentPointer(event, item)}
                {...equipmentPointerHandlers}
                style={{ cursor: "grab", touchAction: "none", userSelect: "none" }}
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
      {dragPreview && DragSymbol && (
        <svg
          className="drag-preview"
          viewBox="-36 -24 72 48"
          width={72 * dragPreview.scale}
          height={48 * dragPreview.scale}
          aria-hidden="true"
          style={{
            position: "fixed",
            left: dragPreview.x,
            top: dragPreview.y,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <DragSymbol x={0} y={0} />
        </svg>
      )}
    </main>
  );
}
