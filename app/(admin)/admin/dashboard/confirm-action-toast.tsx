"use client";

import { toast } from "react-toastify";

let activeConfirmToastId: string | null = null;
let activeConfirmResolver: ((result: boolean) => void) | null = null;

export function confirmActionToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (activeConfirmResolver) {
      activeConfirmResolver(false);
    }

    const toastId = `confirm-${Math.random().toString(36).slice(2)}`;
    let settled = false;

    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      if (activeConfirmToastId === toastId) {
        activeConfirmToastId = null;
        activeConfirmResolver = null;
      }
      toast.dismiss(toastId);
      resolve(result);
    };

    activeConfirmToastId = toastId;
    activeConfirmResolver = finish;

    toast.info(
      <div className="flex flex-col gap-3">
        <p className="text-sm">{message}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="admin-btn-primary px-3! py-1.5! text-xs!"
            onClick={() => finish(true)}
          >
            Підтвердити
          </button>
          <button
            type="button"
            className="admin-btn-secondary px-3! py-1.5! text-xs!"
            onClick={() => finish(false)}
          >
            Скасувати
          </button>
        </div>
      </div>,
      {
        toastId,
        autoClose: false,
        closeOnClick: false,
        onClose: () => finish(false),
      },
    );
  });
}
