export type AuthErrorCode =
  | "INVALID_INPUT"
  | "EMAIL_IN_USE"
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_VERIFIED"
  | "TOKEN_INVALID"
  | "AUTH_ERROR";

export type AuthActionState = {
  success: boolean;
  errorCode: AuthErrorCode | null;
  errorMessage: string | null;
  /** Sign-up succeeded; the UI should show the "check your email" state. */
  pendingVerification?: boolean;
  /** Echoed back so the UI can offer "resend verification" for this address. */
  email?: string | null;
};
