import React from "react";
import TopBar from "@/components/TopBar/TopBar";
import ToolboxPanel from "@/components/Toolbox/ToolboxPanel";
import CircuitGrid from "@/components/CircuitGrid/CircuitGrid";
import ComponentInspectorPanel from "@/components/Controls/ComponentInspectorPanel";
import OutputDistributionChart from "@/components/Results/OutputDistributionChart";
import PhotonOverlapSweepPanel from "@/components/Results/PhotonOverlapSweepPanel";
import TheoryPanel from "@/components/Results/TheoryPanel";
import OutputTablePanel from "@/components/Results/OutputTablePanel";

const LabBenchPage: React.FC = () => {
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
            <CircuitGrid />
            <OutputDistributionChart />
            <PhotonOverlapSweepPanel />
            <TheoryPanel />
            <OutputTablePanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabBenchPage;