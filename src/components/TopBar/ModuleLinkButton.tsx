import React from "react";

const ModuleLinkButton: React.FC = () => {
    return (
        <a
            href="/photonic-circuits-module.pdf"
            target="_blank"
            rel="noreferrer"
            title="Open the Photonic Circuits educational module"
            style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#334155",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                whiteSpace: "nowrap",
            }}
        >
            Photonic Circuits Introduction and Lab Bench Guide
        </a>
    );
};

export default ModuleLinkButton;