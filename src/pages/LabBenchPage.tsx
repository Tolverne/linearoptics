import React from "react";
import TopBar from "@/components/TopBar/TopBar";
import ToolboxPanel from "@/components/Toolbox/ToolboxPanel";
import CircuitGrid from "@/components/CircuitGrid/CircuitGrid";
import ComponentInspectorPanel from "@/components/Controls/ComponentInspectorPanel";
import OutputDistributionChart from "@/components/Results/OutputDistributionChart";
import PhotonOverlapSweepPanel from "@/components/Results/PhotonOverlapSweepPanel";
import TheoryPanel from "@/components/Results/TheoryPanel";
import OutputTablePanel from "@/components/Results/OutputTablePanel";
import { useExperimentStore } from "@/store/useExperimentStore";
import { ExportablePanel } from "@/components/Export/ExportablePanel";

const LabBenchPage: React.FC = () => {
    const railCount = useExperimentStore((state) => state.railCount);
    const inputState = useExperimentStore((state) => state.inputState);
    const components = useExperimentStore((state) => state.components);
    const overlap = useExperimentStore((state) => state.overlap);
    const results = useExperimentStore((state) => state.results);
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          display: "grid",
          gap: 20,
        }}
      >
        <TopBar />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px minmax(900px, 1fr)",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 20,
              alignSelf: "start",
            }}
          >
            <ToolboxPanel />
            <ComponentInspectorPanel />
          </div>

          <div
            style={{
              display: "grid",
              gap: 20,
              alignSelf: "start",
            }}
          >
                      <ExportablePanel
                          title="Circuit Grid"
                          imageFilename="circuit-grid.png"
                          dataFilename="circuit.json"
                          dataFormat="json"
                          data={{
                              railCount,
                              inputState,
                              components,
                              overlap,
                          }}
                      >
                          <CircuitGrid />
                      </ExportablePanel>
                      <ExportablePanel
                          title="Output Distribution"
                          imageFilename="output-distribution.png"
                          dataFilename="output-distribution.json"
                          dataFormat="json"
                          data={results?.intermediateStates ?? []}
                      >
                          <OutputDistributionChart />
                      </ExportablePanel>
            <PhotonOverlapSweepPanel />
                      <ExportablePanel
                          title="Theory Panel"
                          imageFilename="theory-panel.png"
                          dataFilename="theory.json"
                          dataFormat="json"
                          data={results?.theory ?? null}
                      >
                          <TheoryPanel />
                      </ExportablePanel>
            <OutputTablePanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabBenchPage;