import clsx from "clsx";
import styles from "./styles.module.css";

type TableProps = React.ComponentProps<"table">;

export function Table({ children, className, ...props }: TableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={clsx(styles.table, className)} {...props}>
        {children}
      </table>
    </div>
  );
}

type TableHeaderProps = React.ComponentProps<"thead">;

export function TableHeader({
  children,
  className,
  ...props
}: TableHeaderProps) {
  return (
    <thead className={clsx(styles.header, className)} {...props}>
      {children}
    </thead>
  );
}

type TableBodyProps = React.ComponentProps<"tbody">;

export function TableBody({ children, className, ...props }: TableBodyProps) {
  return (
    <tbody className={clsx(className)} {...props}>
      {children}
    </tbody>
  );
}

type TableRowProps = React.ComponentProps<"tr">;

export function TableRow({ children, className, ...props }: TableRowProps) {
  return (
    <tr className={clsx(styles.row, className)} {...props}>
      {children}
    </tr>
  );
}

type TableHeadProps = React.ComponentProps<"th">;

export function TableHead({ children, className, ...props }: TableHeadProps) {
  return (
    <th className={clsx(styles.head, className)} {...props}>
      {children}
    </th>
  );
}

type TableCellProps = React.ComponentProps<"td">;

export function TableCell({ children, className, ...props }: TableCellProps) {
  return (
    <td className={clsx(styles.cell, className)} {...props}>
      {children}
    </td>
  );
}
