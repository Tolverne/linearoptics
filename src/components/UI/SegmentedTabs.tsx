import React from "react";

export type TabItem<T extends string> = {
    id: T;
    label: string;
    icon?: React.ReactNode;
};

type SegmentedTabsProps<T extends string> = {
    tabs: TabItem<T>[];
    value: T;
    onChange: (value: T) => void;
};

export function SegmentedTabs<T extends string>({
    tabs,
    value,
    onChange,
}: SegmentedTabsProps<T>) {
    return (
        <div
            role="tablist"
            style={{
                display: "flex",
                gap: 6,
                padding: 6,
                borderRadius: 14,
                background: "rgba(7, 11, 20, 0.55)",
                border: "1px solid var(--qopt-border-soft)",
                overflowX: "auto",
            }}
        >
            {tabs.map((tab) => {
                const active = tab.id === value;

                return (
                    <button
                        key={tab.id}
                        role="tab"
                        type="button"
                        aria-selected={active}
                        onClick={() => onChange(tab.id)}
                        style={{
                            border: active
                                ? "1px solid rgba(34, 211, 238, 0.55)"
                                : "1px solid transparent",
                            background: active
                                ? "rgba(34, 211, 238, 0.13)"
                                : "transparent",
                            color: active ? "var(--qopt-text)" : "var(--qopt-muted)",
                            borderRadius: 10,
                            padding: "8px 11px",
                            fontSize: 13,
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}