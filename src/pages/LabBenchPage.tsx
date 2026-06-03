import React from "react";
import {
    Activity,
    BarChart3,
    Boxes,
    BrainCircuit,
    CircuitBoard,
    FlaskConical,
    FunctionSquare,
    PanelLeft,
    Sigma,
    Table2,
    Waves,
} from "lucide-react";

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
import TotalVariationSweepPanel from "@/components/Results/TotalVariationSweepPanel";
import PostSelectionPanel from "@/components/Controls/PostSelectionPanel";
import { Panel } from "@/components/UI/Panel";
import { SegmentedTabs, type TabItem } from "@/components/UI/SegmentedTabs";

type ResultsTab =
    | "distribution"
    | "sweep"
    | "variation"
    | "theory"
    | "permanent"
    | "table";

const resultsTabs: TabItem<ResultsTab>[] = [
    {
        id: "distribution",
        label: "Distribution",
        icon: <BarChart3 size={16} />,
    },
    {
        id: "sweep",
        label: "Overlap sweep",
        icon: <Waves size={16} />,
    },
    {
        id: "variation",
        label: "Variation distance",
        icon: <Activity size={16} />,
    },
    {
        id: "theory",
        label: "Theory",
        icon: <FunctionSquare size={16} />,
    },
    {
        id: "permanent",
        label: "Permanent",
        icon: <Sigma size={16} />,
    },
    {
        id: "table",
        label: "Table",
        icon: <Table2 size={16} />,
    },
];

const LabBenchPage: React.FC = () => {
    const [activeResultsTab, setActiveResultsTab] =
        React.useState<ResultsTab>("distribution");

    const railCount = useExperimentStore((state) => state.railCount);
    const inputState = useExperimentStore((state) => state.inputState);
    const components = useExperimentStore((state) => state.components);
    const overlap = useExperimentStore((state) => state.overlap);
    const results = useExperimentStore((state) => state.results);
    const selectedStep = useExperimentStore((state) => state.selectedStep);
    const inspectorMode = useExperimentStore((state) => state.inspectorMode);
    const overlapSweep = useExperimentStore((state) => state.overlapSweep);
    const postSelection = useExperimentStore((state) => state.postSelection);
    const selectedSweepOccupations = useExperimentStore(
        (state) => state.selectedSweepOccupations
    );

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: 22,
                background:
                    "radial-gradient(circle at top left, rgba(34, 211, 238, 0.12), transparent 34rem), radial-gradient(circle at top right, rgba(167, 139, 250, 0.12), transparent 36rem), var(--qopt-bg)",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    maxWidth: 1720,
                    margin: "0 auto",
                    display: "grid",
                    gap: 18,
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: 18,
                    }}
                >
                    <Panel
                        variant="raised"
                        eyebrow="QOpt"
                        title="Quantum Lab Bench"
                        description="Build, simulate, post-select, and analyse linear-optical circuits in a reproducible research workspace."
                        icon={<FlaskConical size={20} />}
                    >
                        <TopBar />
                    </Panel>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "300px minmax(760px, 1fr) 340px",
                            gap: 18,
                            alignItems: "start",
                        }}
                    >
                        <aside
                            style={{
                                display: "grid",
                                gap: 18,
                                position: "sticky",
                                top: 18,
                            }}
                        >
                            <Panel
                                title="Build"
                                description="Drag optical components onto the circuit grid."
                                icon={<Boxes size={18} />}
                                variant="soft"
                            >
                                <ToolboxPanel />
                            </Panel>
                        </aside>

                        <main
                            style={{
                                display: "grid",
                                gap: 18,
                                minWidth: 0,
                            }}
                        >
                            <Panel
                                title="Circuit workspace"
                                description="The circuit is evaluated from left to right. Columns correspond to sequential optical operations."
                                icon={<CircuitBoard size={18} />}
                                variant="raised"
                                style={{ boxShadow: "var(--qopt-shadow-glow)" }}
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
                            </Panel>

                            <Panel
                                title="Analysis"
                                description="Switch between output probabilities, distinguishability sweeps, theory data, permanents, and raw tables."
                                icon={<BrainCircuit size={18} />}
                                variant="raised"
                                actions={
                                    <SegmentedTabs
                                        tabs={resultsTabs}
                                        value={activeResultsTab}
                                        onChange={setActiveResultsTab}
                                    />
                                }
                            >
                                {activeResultsTab === "distribution" && (
                                    <ExportablePanel
                                        title="Output Distribution"
                                        imageFilename="output-distribution.png"
                                        dataFilename="output-distribution.json"
                                        dataFormat="json"
                                        data={{
                                            selectedStep,
                                            overlap,
                                            inspectorMode,
                                            postSelection,
                                            exactIntermediateStates: results?.intermediateStates ?? [],
                                            sampledIntermediateStates:
                                                results?.sampledIntermediateStates ?? [],
                                            overlapSweep: results?.overlapSweep ?? null,
                                            sampledOverlapSweep: results?.sampledOverlapSweep ?? null,
                                        }}
                                    >
                                        <OutputDistributionChart />
                                    </ExportablePanel>
                                )}

                                {activeResultsTab === "sweep" && (
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
                                )}

                                {activeResultsTab === "variation" && (
                                    <ExportablePanel
                                        title="Total Variation Distance"
                                        imageFilename="total-variation-distance.png"
                                        dataFilename="total-variation-distance.json"
                                        dataFormat="json"
                                        data={{
                                            selectedStep,
                                            overlapSweepOptions: overlapSweep,
                                            theorySweep: results?.overlapSweep ?? null,
                                        }}
                                    >
                                        <TotalVariationSweepPanel />
                                    </ExportablePanel>
                                )}

                                {activeResultsTab === "theory" && (
                                    <ExportablePanel
                                        title="Theory Panel"
                                        imageFilename="theory-panel.png"
                                        dataFilename="theory.json"
                                        dataFormat="json"
                                        data={results?.theory ?? null}
                                    >
                                        <TheoryPanel />
                                    </ExportablePanel>
                                )}

                                {activeResultsTab === "permanent" && (
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
                                )}

                                {activeResultsTab === "table" && <OutputTablePanel />}
                            </Panel>
                        </main>

                        <aside
                            style={{
                                display: "grid",
                                gap: 18,
                                position: "sticky",
                                top: 18,
                            }}
                        >
                            <Panel
                                title="Inspector"
                                description="Edit the currently selected optical component."
                                icon={<PanelLeft size={18} />}
                                variant="soft"
                            >
                                <ComponentInspectorPanel />
                            </Panel>

                            <Panel
                                title="Post-selection"
                                description="Filter accepted outcomes and inspect conditional behaviour."
                                icon={<Activity size={18} />}
                                variant="soft"
                            >
                                <PostSelectionPanel />
                            </Panel>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabBenchPage;