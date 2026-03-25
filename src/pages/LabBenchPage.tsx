import React from "react";
import TopBar from "@/components/TopBar/TopBar";
import ToolboxPanel from "@/components/Toolbox/ToolboxPanel";
import CircuitGrid from "@/components/CircuitGrid/CircuitGrid";
import InputStatePanel from "@/components/Controls/InputStatePanel";
import DistinguishabilityPanel from "@/components/Controls/DistinguishabilityPanel";
import SimulationOptionsPanel from "@/components/Controls/SimulationOptionsPanel";
import ComponentInspectorPanel from "@/components/Controls/ComponentInspectorPanel";
import StateInspectorPanel from "@/components/Results/StateInspectorPanel";
import OutputDistributionChart from "@/components/Results/OutputDistributionChart";
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

        {/* Main work area */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "360px minmax(900px, 1fr)",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* Left control column */}
          <div
            style={{
              display: "grid",
              gap: 20,
              alignSelf: "start",
            }}
          >
            <ToolboxPanel />
            <ComponentInspectorPanel />
            <InputStatePanel />
            <DistinguishabilityPanel />
            <SimulationOptionsPanel />
            
          </div>

          {/* Right circuit area */}
          <div
            style={{
              display: "grid",
              gap: 20,
              alignSelf: "start",
            }}
          >
            <CircuitGrid />
          </div>
        </div>

        {/* Results area */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(380px, 1fr) minmax(420px, 1fr)",
            gap: 20,
            alignItems: "start",
          }}
        >
          <StateInspectorPanel />
          <OutputDistributionChart />
        </div>

        <div>
          <OutputTablePanel />
        </div>
      </div>
    </div>
  );
};

export default LabBenchPage;