import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { subscribe, removeToast } from "./toast-store";
import type { ToastItem } from "./toast-store";
import styles from "./styles.module.css";

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribe(setItems);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className={`${styles.toast} ${styles[item.type]}`}>
          {item.type === "success" ? (
            <CheckCircle size={18} className={styles.icon} />
          ) : (
            <AlertCircle size={18} className={styles.icon} />
          )}
          <span className={styles.message}>{item.message}</span>
          <button
            className={styles.close}
            onClick={() => removeToast(item.id)}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
