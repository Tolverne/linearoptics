import React from "react";

type PanelProps = {
    title?: string;
    eyebrow?: string;
    description?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    variant?: "default" | "raised" | "soft";
    style?: React.CSSProperties;
};

const panelBackground: Record<NonNullable<PanelProps["variant"]>, string> = {
    default: "linear-gradient(180deg, rgba(16, 24, 39, 0.98), rgba(12, 18, 31, 0.98))",
    raised: "linear-gradient(180deg, rgba(23, 32, 51, 0.98), rgba(14, 22, 37, 0.98))",
    soft: "rgba(17, 28, 47, 0.72)",
};

export const Panel: React.FC<PanelProps> = ({
    title,
    eyebrow,
    description,
    icon,
    actions,
    children,
    variant = "default",
    style,
}) => {
    return (
        <section
            style={{
                border: "1px solid var(--qopt-border)",
                borderRadius: "var(--qopt-radius-lg)",
                background: panelBackground[variant],
                boxShadow: "var(--qopt-shadow-card)",
                overflow: "hidden",
                ...style,
            }}
        >
            {(title || eyebrow || description || actions) && (
                <div
                    style={{
                        padding: "16px 18px",
                        borderBottom: "1px solid var(--qopt-border-soft)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16,
                    }}
                >
                    <div style={{ display: "flex", gap: 12, minWidth: 0 }}>
                        {icon && (
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 12,
                                    display: "grid",
                                    placeItems: "center",
                                    color: "var(--qopt-cyan)",
                                    background: "rgba(34, 211, 238, 0.1)",
                                    border: "1px solid rgba(34, 211, 238, 0.2)",
                                    flexShrink: 0,
                                }}
                            >
                                {icon}
                            </div>
                        )}

                        <div style={{ minWidth: 0 }}>
                            {eyebrow && (
                                <div
                                    style={{
                                        color: "var(--qopt-cyan)",
                                        fontSize: 11,
                                        fontWeight: 800,
                                        letterSpacing: 1.4,
                                        textTransform: "uppercase",
                                        marginBottom: 4,
                                    }}
                                >
                                    {eyebrow}
                                </div>
                            )}

                            {title && (
                                <h2
                                    style={{
                                        margin: 0,
                                        color: "var(--qopt-text)",
                                        fontSize: 16,
                                        lineHeight: 1.2,
                                        fontWeight: 800,
                                    }}
                                >
                                    {title}
                                </h2>
                            )}

                            {description && (
                                <p
                                    style={{
                                        margin: "6px 0 0",
                                        color: "var(--qopt-muted)",
                                        fontSize: 13,
                                        lineHeight: 1.45,
                                        maxWidth: 760,
                                    }}
                                >
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
                </div>
            )}

            <div style={{ padding: 16 }}>{children}</div>
        </section>
    );
};