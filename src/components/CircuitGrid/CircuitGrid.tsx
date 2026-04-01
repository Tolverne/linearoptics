import React, { useMemo, useState } from "react";
import BeamSplitterNode from "./BeamSplitterNode";
import PhaseShifterNode from "./PhaseShifterNode";
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
const RAIL_STROKE_WIDTH = 5;
const RAIL_GLOW = "rgba(15,23,42,0.12)";
const GRID_LINE = "#e2e8f0";
const GRID_BACKGROUND = "#f8fafc";

const MIN_RAILS = 2;
const MAX_RAILS = 6;

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
  const inputState = useExperimentStore((state) => state.inputState);
  const components = useExperimentStore((state) => state.components);
  const selectedComponentId = useExperimentStore(
    (state) => state.selectedComponentId
  );
  const selectedStep = useExperimentStore((state) => state.selectedStep);

  const addComponent = useExperimentStore((state) => state.addComponent);
  const setSelectedComponentId = useExperimentStore(
    (state) => state.setSelectedComponentId
  );
  const setSelectedStep = useExperimentStore((state) => state.setSelectedStep);
  const setError = useExperimentStore((state) => state.setError);
  const setRailCount = useExperimentStore((state) => state.setRailCount);
  const setInputPhoton = useExperimentStore((state) => state.setInputPhoton);

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
    setSelectedStep(component.column);
    setError(null);
  };

  const handleColumnSelect = (column: number) => {
    setSelectedStep(column);
    setSelectedComponentId(null);
  };

  const handleComponentSelect = (component: CircuitComponent) => {
    setSelectedComponentId(component.id);
    setSelectedStep(component.column);
  };

  const renderColumnHeaders = () => {
    return Array.from({ length: columnCount }, (_, column) => {
      const isSelected = selectedStep === column;

      return (
        <button
          key={column}
          type="button"
          onClick={() => handleColumnSelect(column)}
          style={{
            width: COLUMN_WIDTH,
            textAlign: "center",
            fontSize: 12,
            fontWeight: 700,
            color: isSelected ? "#1d4ed8" : "#64748b",
            paddingBottom: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          C{column + 1}
        </button>
      );
    });
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
          alignItems: "flex-end",
          gap: 12,
          minWidth: 140 + gridWidth,
          marginBottom: 2,
        }}
      >
        <div
          style={{
            width: 140,
            flexShrink: 0,
          }}
        >
          <label
            htmlFor="rail-count-inline"
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 700,
              color: "#475569",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            Rails
          </label>
          <select
            id="rail-count-inline"
            value={railCount}
            onChange={(event) => setRailCount(Number(event.target.value))}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              fontSize: 14,
              color: "#0f172a",
              fontWeight: 600,
            }}
          >
            {Array.from(
              { length: MAX_RAILS - MIN_RAILS + 1 },
              (_, i) => MIN_RAILS + i
            ).map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex" }}>{renderColumnHeaders()}</div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          minWidth: 140 + gridWidth,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateRows: `repeat(${railCount}, ${ROW_HEIGHT}px)`,
            width: 140,
            flexShrink: 0,
          }}
        >
          {Array.from({ length: railCount }, (_, rail) => (
            <div
              key={rail}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 12,
                boxSizing: "border-box",
              }}
            >
              <input
                type="number"
                min={0}
                step={1}
                value={inputState[rail] ?? 0}
                onChange={(event) =>
                  setInputPhoton(rail, Math.max(0, Number(event.target.value)))
                }
                style={{
                  width: 64,
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: 14,
                  textAlign: "center",
                  color: "#0f172a",
                  fontWeight: 600,
                }}
              />
            </div>
          ))}
        </div>

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
                  pointerEvents: "none",
                }}
              />
            );
          })}

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
                  pointerEvents: "none",
                }}
              />
            );
          })}

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

          {selectedStep >= 0 && selectedStep < columnCount && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: selectedStep * COLUMN_WIDTH,
                width: COLUMN_WIDTH,
                height: "100%",
                background: "rgba(59, 130, 246, 0.08)",
                pointerEvents: "none",
              }}
            />
          )}

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
                  onClick={() => handleColumnSelect(column)}
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
                    cursor: "pointer",
                  }}
                />
              );
            })
          )}

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
                  onSelect={() => handleComponentSelect(component)}
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
                  onSelect={() => handleComponentSelect(component)}
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
                onSelect={() => handleComponentSelect(component)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CircuitGrid;