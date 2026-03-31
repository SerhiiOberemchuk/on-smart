export function getBundleSaveButtonState(isPending: boolean, uploadingDocumentCount: number) {
  const isDisabled = isPending || uploadingDocumentCount > 0;
  const label = isPending ? "Оновлення..." : "Зберегти все";

  return { isDisabled, label };
}

