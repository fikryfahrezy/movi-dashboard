import clsx from "clsx";
import styles from "./styles.module.css";

type SelectProps = React.ComponentProps<"select"> & {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
};

export function Select({
  ref,
  label,
  error,
  options,
  className,
  ...props
}: SelectProps) {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <select
        ref={ref}
        className={clsx(styles.select, error && styles.selectError, className)}
        {...props}
      >
        {options.map((option) => {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
