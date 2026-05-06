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
import PermanentExplorerPanel from "@/components/Results/PermanentExplorerPanel";

const LabBenchPage: React.FC = () => {
    const railCount = useExperimentStore((state) => state.railCount);
    const inputState = useExperimentStore((state) => state.inputState);
    const components = useExperimentStore((state) => state.components);
    const overlap = useExperimentStore((state) => state.overlap);
    const results = useExperimentStore((state) => state.results);
    const selectedStep = useExperimentStore((state) => state.selectedStep);
    const inspectorMode = useExperimentStore((state) => state.inspectorMode);
    const overlapSweep = useExperimentStore((state) => state.overlapSweep);
    const selectedSweepOccupations = useExperimentStore(
        (state) => state.selectedSweepOccupations
    );
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
                          data={{
                              selectedStep,
                              overlap,
                              inspectorMode,
                              exactIntermediateStates: results?.intermediateStates ?? [],
                              sampledIntermediateStates: results?.sampledIntermediateStates ?? [],
                              overlapSweep: results?.overlapSweep ?? null,
                              sampledOverlapSweep: results?.sampledOverlapSweep ?? null,
                          }}
                      >
                          <OutputDistributionChart />
                      </ExportablePanel>

                      <ExportablePanel
                          title="Photon Overlap Sweep"
                          imageFilename="photon-overlap-sweep.png"
                          dataFilename="photon-overlap-sweep.json"
                          dataFormat="json"
                          data={{
                              selectedStep,
                              selectedSweepOccupations,
                              overlapSweepOptions: overlapSweep,
                              theorySweep: results?.overlapSweep ?? null,
                              sampledSweep: results?.sampledOverlapSweep ?? null,
                          }}
                      >
                          <PhotonOverlapSweepPanel />
                      </ExportablePanel>

                      <ExportablePanel
                          title="Theory Panel"
                          imageFilename="theory-panel.png"
                          dataFilename="theory.json"
                          dataFormat="json"
                          data={results?.theory ?? null}
                      >
                          <TheoryPanel />
                      </ExportablePanel>

                      <ExportablePanel
                          title="Permanent Explorer"
                          imageFilename="permanent-explorer.png"
                          dataFilename="permanent-explorer.json"
                          dataFormat="json"
                          data={{
                              inputState,
                              selectedStep,
                              theory: results?.theory ?? null,
                          }}
                      >
                          <PermanentExplorerPanel />
                      </ExportablePanel>

                      <OutputTablePanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabBenchPage;