import { Bell, User } from "lucide-react";
import styles from "./header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.search}>{/* Optional global search */}</div>
      <div className={styles.actions}>
        <button className={styles.iconButton}>
          <Bell size={20} />
        </button>
        <div className={styles.profile}>
          <div className={styles.avatar}>
            <User size={20} />
          </div>
          <span className={styles.name}>Admin User</span>
        </div>
      </div>
    </header>
  );
}
