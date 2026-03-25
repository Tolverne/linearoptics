import React, { useMemo, useState } from "react";
import BeamSplitterNode from "./BeamSplitterNode";
import PhaseShifterNode from "./PhaseShifterNode";
import RailLabels from "./RailLabels";
import SwapNode from "./SwapNode";
import { useExperimentStore } from "@/store/useExperimentStore";
import type {
  BeamSplitterComponent,
  CircuitComponent,
  PhaseShifterComponent,
  SwapComponent,
  ToolboxItemType,
} from "@/types/simulation";

const ROW_HEIGHT = 72;
const COLUMN_WIDTH = 96;
const DEFAULT_COLUMN_COUNT = 8;

const RAIL_STROKE = "#0f172a";
const RAIL_STROKE_WIDTH = 6;
const RAIL_GLOW = "rgba(15,23,42,0.08)";
const GRID_LINE = "#e2e8f0";
const GRID_BACKGROUND = "#f8fafc";

function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function sortComponents(components: CircuitComponent[]): CircuitComponent[] {
  return [...components].sort((a, b) => {
    if (a.column !== b.column) return a.column - b.column;

    const aRail = "rail" in a ? a.rail : Math.min(...a.rails);
    const bRail = "rail" in b ? b.rail : Math.min(...b.rails);

    return aRail - bRail;
  });
}

function getOccupiedRails(component: CircuitComponent): number[] {
  if ("rail" in component) return [component.rail];
  return component.rails;
}

function parseDraggedToolType(event: React.DragEvent): ToolboxItemType | null {
  const rawJson = event.dataTransfer.getData("application/json");
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson) as { toolType?: ToolboxItemType };
      if (
        parsed.toolType === "beam_splitter" ||
        parsed.toolType === "phase_shifter" ||
        parsed.toolType === "swap"
      ) {
        return parsed.toolType;
      }
    } catch {
      // ignore malformed json and try fallback
    }
  }

  const plain = event.dataTransfer.getData("text/plain");
  if (
    plain === "beam_splitter" ||
    plain === "phase_shifter" ||
    plain === "swap"
  ) {
    return plain;
  }

  return null;
}

function createComponent(
  toolType: ToolboxItemType,
  rail: number,
  column: number,
  railCount: number
): CircuitComponent | null {
  if (toolType === "phase_shifter") {
    const component: PhaseShifterComponent = {
      id: makeId("ps"),
      type: "phase_shifter",
      column,
      rail,
      params: { phi: Math.PI / 2 },
    };
    return component;
  }

  if (toolType === "beam_splitter") {
    const anchorRail = Math.min(rail, railCount - 2);
    if (anchorRail < 0 || anchorRail >= railCount - 1) return null;

    const component: BeamSplitterComponent = {
      id: makeId("bs"),
      type: "beam_splitter",
      column,
      rails: [anchorRail, anchorRail + 1],
      params: { theta: Math.PI / 2 },
    };
    return component;
  }

  if (toolType === "swap") {
    const anchorRail = Math.min(rail, railCount - 2);
    if (anchorRail < 0 || anchorRail >= railCount - 1) return null;

    const component: SwapComponent = {
      id: makeId("sw"),
      type: "swap",
      column,
      rails: [anchorRail, anchorRail + 1],
    };
    return component;
  }

  return null;
}

const CircuitGrid: React.FC = () => {
  const railCount = useExperimentStore((state) => state.railCount);
  const components = useExperimentStore((state) => state.components);
  const selectedComponentId = useExperimentStore(
    (state) => state.selectedComponentId
  );
  const selectedStep = useExperimentStore((state) => state.selectedStep);

  const addComponent = useExperimentStore((state) => state.addComponent);
  const setSelectedComponentId = useExperimentStore(
    (state) => state.setSelectedComponentId
  );
  const setError = useExperimentStore((state) => state.setError);

  const [hoverCell, setHoverCell] = useState<{ rail: number; column: number } | null>(
    null
  );

  const sortedComponents = useMemo(
    () => sortComponents(components),
    [components]
  );

  const maxComponentColumn =
    components.length > 0 ? Math.max(...components.map((c) => c.column)) : -1;
  const columnCount = Math.max(DEFAULT_COLUMN_COUNT, maxComponentColumn + 2);

  const gridWidth = columnCount * COLUMN_WIDTH;
  const gridHeight = railCount * ROW_HEIGHT;

  const componentConflicts = useMemo(() => {
    const occupied = new Set<string>();
    for (const component of components) {
      const rails = getOccupiedRails(component);
      for (const rail of rails) {
        occupied.add(`${component.column}:${rail}`);
      }
    }
    return occupied;
  }, [components]);

  const handleDrop = (event: React.DragEvent, rail: number, column: number) => {
    event.preventDefault();
    setHoverCell(null);

    const toolType = parseDraggedToolType(event);
    if (!toolType) {
      setError("Could not determine dragged component type.");
      return;
    }

    const component = createComponent(toolType, rail, column, railCount);
    if (!component) {
      setError("That component cannot be placed on this cell.");
      return;
    }

    const occupiedRails = getOccupiedRails(component);
    const hasConflict = occupiedRails.some((r) =>
      componentConflicts.has(`${column}:${r}`)
    );

    if (hasConflict) {
      setError("That placement overlaps an existing component.");
      return;
    }

    addComponent(component);
    setSelectedComponentId(component.id);
    setError(null);
  };

  const renderColumnHeaders = () => {
    return Array.from({ length: columnCount }, (_, column) => (
      <div
        key={column}
        style={{
          width: COLUMN_WIDTH,
          textAlign: "center",
          fontSize: 12,
          fontWeight: 600,
          color: selectedStep === column + 1 ? "#1d4ed8" : "#64748b",
          paddingBottom: 8,
        }}
      >
        C{column + 1}
      </div>
    ));
  };

  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: 16,
        background: "#ffffff",
        padding: 16,
        overflowX: "auto",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          minWidth: 80 + gridWidth,
        }}
      >
        <div style={{ width: 80 }} />
        <div style={{ display: "flex" }}>{renderColumnHeaders()}</div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          minWidth: 80 + gridWidth,
        }}
      >
        <RailLabels railCount={railCount} rowHeight={ROW_HEIGHT} />

        <div
          style={{
            position: "relative",
            width: gridWidth,
            height: gridHeight,
            borderRadius: 14,
            background: GRID_BACKGROUND,
            border: "1px solid #cbd5e1",
            overflow: "hidden",
          }}
        >
          {/* horizontal rail glows */}
          {Array.from({ length: railCount }, (_, rail) => {
            const y = rail * ROW_HEIGHT + ROW_HEIGHT / 2;

            return (
              <div
                key={`rail-glow-${rail}`}
                style={{
                  position: "absolute",
                  left: 0,
                  top: y - 4.5,
                  width: "100%",
                  height: 9,
                  background: RAIL_GLOW,
                  borderRadius: 999,
                  opacity: 1,
                  pointerEvents: "none",
                }}
              />
            );
          })}

          {/* main rails */}
          {Array.from({ length: railCount }, (_, rail) => {
            const y = rail * ROW_HEIGHT + ROW_HEIGHT / 2;

            return (
              <div
                key={`rail-line-${rail}`}
                style={{
                  position: "absolute",
                  left: 0,
                  top: y - RAIL_STROKE_WIDTH / 2,
                  width: "100%",
                  height: RAIL_STROKE_WIDTH,
                  background: RAIL_STROKE,
                  borderRadius: 999,
                  opacity: 1,
                  pointerEvents: "none",
                }}
              />
            );
          })}

          {/* vertical grid lines */}
          {Array.from({ length: columnCount + 1 }, (_, column) => (
            <div
              key={`vertical-${column}`}
              style={{
                position: "absolute",
                top: 0,
                left: column * COLUMN_WIDTH,
                width: 1,
                height: "100%",
                background: GRID_LINE,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* selected column highlight */}
          {selectedStep > 0 && selectedStep - 1 < columnCount && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: (selectedStep - 1) * COLUMN_WIDTH,
                width: COLUMN_WIDTH,
                height: "100%",
                background: "rgba(59, 130, 246, 0.08)",
                pointerEvents: "none",
              }}
            />
          )}

          {/* drop cells */}
          {Array.from({ length: railCount }, (_, rail) =>
            Array.from({ length: columnCount }, (_, column) => {
              const isHovered =
                hoverCell?.rail === rail && hoverCell?.column === column;

              return (
                <div
                  key={`cell-${rail}-${column}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setHoverCell({ rail, column });
                  }}
                  onDragLeave={() => {
                    setHoverCell((current) => {
                      if (
                        current?.rail === rail &&
                        current?.column === column
                      ) {
                        return null;
                      }
                      return current;
                    });
                  }}
                  onDrop={(event) => handleDrop(event, rail, column)}
                  onClick={() => setSelectedComponentId(null)}
                  style={{
                    position: "absolute",
                    left: column * COLUMN_WIDTH,
                    top: rail * ROW_HEIGHT,
                    width: COLUMN_WIDTH,
                    height: ROW_HEIGHT,
                    boxSizing: "border-box",
                    background: isHovered
                      ? "rgba(16, 185, 129, 0.08)"
                      : "transparent",
                  }}
                />
              );
            })
          )}

          {/* components */}
          {sortedComponents.map((component) => {
            const isSelected = component.id === selectedComponentId;

            if (component.type === "beam_splitter") {
              return (
                <BeamSplitterNode
                  key={component.id}
                  component={component}
                  rowHeight={ROW_HEIGHT}
                  columnWidth={COLUMN_WIDTH}
                  isSelected={isSelected}
                  onSelect={setSelectedComponentId}
                />
              );
            }

            if (component.type === "phase_shifter") {
              return (
                <PhaseShifterNode
                  key={component.id}
                  component={component}
                  rowHeight={ROW_HEIGHT}
                  columnWidth={COLUMN_WIDTH}
                  isSelected={isSelected}
                  onSelect={setSelectedComponentId}
                />
              );
            }

            return (
              <SwapNode
                key={component.id}
                component={component}
                rowHeight={ROW_HEIGHT}
                columnWidth={COLUMN_WIDTH}
                isSelected={isSelected}
                onSelect={setSelectedComponentId}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CircuitGrid;