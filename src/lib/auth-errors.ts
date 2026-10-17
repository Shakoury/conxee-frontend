import { ApiError } from './api';
export function authError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403)
      return 'This request was not allowed. Please try again or contact support.';
    if (error.status === 429)
      return 'Too many attempts. Please wait a moment and try again.';
    if (error.status === 409)
      return 'This email or username is already in use. Try another or log in.';
    if (error.status === 400 || error.status === 422)
      return 'Check your details and try again.';
    if (error.status === 401)
      return 'We could not verify those details. Please try again.';
    if (error.status === 410)
      return 'This link or code has expired. Request a new one.';
  }
  return 'We couldn’t connect right now. Please try again.';
}
