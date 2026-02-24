import { NavLink } from "react-router-dom";
import { LayoutDashboard, Database } from "lucide-react";
import clsx from "clsx";
import styles from "./sidebar.module.css";

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>Data Sync</h2>
      </div>
      <nav className={styles.nav}>
        <NavLink
          to="/"
          className={({ isActive }) => {
            return clsx(styles.navItem, isActive && styles.active);
          }}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/data"
          className={({ isActive }) => {
            return clsx(styles.navItem, isActive && styles.active);
          }}
        >
          <Database size={20} />
          <span>Data Management</span>
        </NavLink>
      </nav>
    </aside>
  );
}
