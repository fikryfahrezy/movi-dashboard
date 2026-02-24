import clsx from "clsx";
import styles from "./styles.module.css";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(styles.button, styles[variant], styles[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
