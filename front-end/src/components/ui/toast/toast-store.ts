export type ToastType = "success" | "error";

export type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type Listener = (toasts: ToastItem[]) => void;

let _toasts: ToastItem[] = [];
let _listeners: Listener[] = [];
let _nextId = 0;

export function subscribe(listener: Listener) {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter((l) => l !== listener);
  };
}

export function getToasts() {
  return _toasts;
}

function _notify() {
  _listeners.forEach((l) => l(_toasts));
}

export function removeToast(id: number) {
  _toasts = _toasts.filter((t) => t.id !== id);
  _notify();
}

function _add(type: ToastType, message: string) {
  const id = _nextId++;
  _toasts = [..._toasts, { id, type, message }];
  _notify();
  setTimeout(() => removeToast(id), 4000);
}

export const toast = {
  success: (message: string) => _add("success", message),
  error: (message: string) => _add("error", message),
};
