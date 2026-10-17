import { Code, ConnectError } from '@connectrpc/connect';

/**
 * What the UI needs to know about a failed call:
 *
 * - `not-configured`: no server address or API key saved yet.
 * - `unreachable`: the request didn't reach the server (offline, DNS,
 *   refused, CORS, timeout).
 * - `unauthenticated`: the API key was rejected; send the user to Settings.
 * - `not-found`: the thing changed elsewhere; refresh the tree.
 * - `already-exists` / `invalid-argument`: shown next to the input.
 * - `unknown`: anything else.
 */
export type ApiError =
  | { kind: 'not-configured' }
  | { kind: 'unreachable' }
  | { kind: 'unauthenticated' }
  | { kind: 'not-found' }
  | { kind: 'already-exists'; message: string }
  | { kind: 'invalid-argument'; message: string }
  | { kind: 'unknown'; message: string };

export class ApiException extends Error {
  constructor(readonly error: ApiError) {
    super(error.kind);
  }
}

export const toApiError = (err: unknown): ApiError => {
  if (err instanceof ApiException) return err.error;
  const e = ConnectError.from(err);
  switch (e.code) {
    case Code.Unavailable:
    case Code.DeadlineExceeded:
    case Code.Canceled:
      return { kind: 'unreachable' };
    case Code.Unauthenticated:
      return { kind: 'unauthenticated' };
    case Code.NotFound:
      return { kind: 'not-found' };
    case Code.AlreadyExists:
      return { kind: 'already-exists', message: e.rawMessage };
    case Code.InvalidArgument:
      return { kind: 'invalid-argument', message: e.rawMessage };
    default:
      return { kind: 'unknown', message: e.rawMessage };
  }
};

/** A sentence for errors shown on their own (snackbars, dialogs). */
export const errorMessage = (error: ApiError): string => {
  switch (error.kind) {
    case 'not-configured':
      return 'Set up the server in Settings.';
    case 'unreachable':
      return 'Couldn’t reach the server. Check your connection.';
    case 'unauthenticated':
      return 'The API key was rejected.';
    case 'not-found':
      return 'It was changed on another device. Refreshed.';
    case 'already-exists':
    case 'invalid-argument':
      return capitalize(error.message) || 'The server rejected the change.';
    case 'unknown':
      return 'Something went wrong on the server.';
  }
};

const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
