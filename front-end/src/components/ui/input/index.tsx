import clsx from "clsx";
import styles from "./styles.module.css";

type InputProps = React.ComponentProps<"input"> & {
  label?: string;
  error?: string;
};

export function Input({ ref, label, error, className, ...props }: InputProps) {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        ref={ref}
        className={clsx(styles.input, error && styles.inputError, className)}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
