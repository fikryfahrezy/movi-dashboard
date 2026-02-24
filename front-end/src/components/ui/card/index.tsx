import clsx from "clsx";
import styles from "./styles.module.css";

type CardProps = React.ComponentProps<"div">;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={clsx(styles.card, className)} {...props}>
      {children}
    </div>
  );
}

type CardHeaderProps = React.ComponentProps<"div">;

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={clsx(styles.header, className)} {...props}>
      {children}
    </div>
  );
}

type CardTitleProps = React.ComponentProps<"h3">;

export function CardTitle({ children, className, ...props }: CardTitleProps) {
  return (
    <h3 className={clsx(styles.title, className)} {...props}>
      {children}
    </h3>
  );
}

type CardContentProps = React.ComponentProps<"div">;

export function CardContent({
  children,
  className,
  ...props
}: CardContentProps) {
  return (
    <div className={clsx(styles.content, className)} {...props}>
      {children}
    </div>
  );
}
