export const PRODUCT_SAVE_ALL_EVENT = "product-admin-save-all";
export const PRODUCT_SAVE_ALL_ACTIVITY_EVENT = "product-admin-save-all-activity";
export const PRODUCT_SAVE_ALL_RESULT_EVENT = "product-admin-save-all-result";

type SaveAllOptions = {
  emit: (eventName: string) => void;
  submit: () => void;
};

type SaveAllActivityOptions = {
  emit: (eventName: string, detail: { delta: number }) => void;
  delta: number;
};

type SaveAllResultOptions = {
  emit: (eventName: string, detail: { status: "success" | "error"; message?: string }) => void;
  status: "success" | "error";
  message?: string;
};

export function runProductSaveAll({ emit, submit }: SaveAllOptions) {
  emit(PRODUCT_SAVE_ALL_EVENT);
  submit();
}

export function reportProductSaveAllActivity({ emit, delta }: SaveAllActivityOptions) {
  emit(PRODUCT_SAVE_ALL_ACTIVITY_EVENT, { delta });
}

export function reportProductSaveAllResult({ emit, status, message }: SaveAllResultOptions) {
  emit(PRODUCT_SAVE_ALL_RESULT_EVENT, { status, message });
}
