import { Code, ConnectError, createClient, type Client, type Interceptor } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { DirectoryService } from '../gen/miolink/directory/v1/directory_service_pb';
import { HealthService } from '../gen/miolink/health/v1/health_service_pb';
import { LinkService } from '../gen/miolink/link/v1/link_service_pb';
import { TreeService } from '../gen/miolink/tree/v1/tree_service_pb';
import { ApiException } from './errors';
import { settingsStore } from './settings';

export type Clients = {
  health: Client<typeof HealthService>;
  tree: Client<typeof TreeService>;
  directory: Client<typeof DirectoryService>;
  link: Client<typeof LinkService>;
};

/** Every call fails after this long instead of hanging (derived, generous for CreateLink's page fetch). */
const TIMEOUT_MS = 30_000;

/**
 * fetch that reports transport failures (offline, DNS, refused, CORS) as
 * `Unavailable`, so they map to "unreachable" instead of "unknown".
 */
const fetchUnavailable: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ConnectError(err instanceof Error ? err.message : 'network error', Code.Unavailable);
  }
};

/** Builds the Connect clients for a server address and API key. */
export const createClients = (baseUrl: string, apiKey: string): Clients => {
  const auth: Interceptor = (next) => (req) => {
    req.header.set('Authorization', `Bearer ${apiKey}`);
    return next(req);
  };
  const transport = createConnectTransport({
    baseUrl,
    interceptors: [auth],
    fetch: fetchUnavailable,
    defaultTimeoutMs: TIMEOUT_MS,
  });
  return {
    health: createClient(HealthService, transport),
    tree: createClient(TreeService, transport),
    directory: createClient(DirectoryService, transport),
    link: createClient(LinkService, transport),
  };
};

let cached: { baseUrl: string; apiKey: string; clients: Clients } | undefined;

/**
 * The clients for the saved settings, rebuilt when they change. Call it for
 * every request instead of keeping a client, so new settings apply at once.
 * Throws `not-configured` until a server and key are saved.
 */
export const api = (): Clients => {
  const { baseUrl, apiKey } = settingsStore.state;
  if (!baseUrl || !apiKey) throw new ApiException({ kind: 'not-configured' });
  if (!cached || cached.baseUrl !== baseUrl || cached.apiKey !== apiKey) {
    cached = { baseUrl, apiKey, clients: createClients(baseUrl, apiKey) };
  }
  return cached.clients;
};

/** Absolute URL of a link's thumbnail (`thumbnail_url` is relative to the API base URL), or undefined. */
export const thumbnailSrc = (thumbnailUrl: string): string | undefined =>
  thumbnailUrl ? `${settingsStore.state.baseUrl}${thumbnailUrl}` : undefined;
