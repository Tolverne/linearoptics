import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    icon?: React.ReactNode;
};

const styles: Record<NonNullable<ButtonProps["variant"]>, React.CSSProperties> = {
    primary: {
        color: "#03111a",
        background: "linear-gradient(135deg, var(--qopt-cyan), var(--qopt-blue))",
        border: "1px solid rgba(34, 211, 238, 0.9)",
        boxShadow: "0 0 24px rgba(34, 211, 238, 0.24)",
    },
    secondary: {
        color: "var(--qopt-text)",
        background: "rgba(23, 32, 51, 0.92)",
        border: "1px solid var(--qopt-border)",
    },
    ghost: {
        color: "var(--qopt-muted)",
        background: "transparent",
        border: "1px solid transparent",
    },
    danger: {
        color: "#ffe4e6",
        background: "rgba(251, 113, 133, 0.12)",
        border: "1px solid rgba(251, 113, 133, 0.3)",
    },
};

export const Button: React.FC<ButtonProps> = ({
    variant = "secondary",
    icon,
    children,
    style,
    ...props
}) => {
    return (
        <button
            {...props}
            style={{
                minHeight: 36,
                borderRadius: 12,
                padding: "8px 12px",
                cursor: props.disabled ? "not-allowed" : "pointer",
                fontSize: 13,
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: props.disabled ? 0.55 : 1,
                ...styles[variant],
                ...style,
            }}
        >
            {icon}
            {children}
        </button>
    );
};