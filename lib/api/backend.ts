const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

export class BackendRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "BackendRequestError";
  }
}

function getBackendBaseUrl(): string {
  const configuredUrl = process.env.BACKEND_API_URL?.trim();

  if (!configuredUrl) {
    throw new BackendRequestError(
      "The backend API URL is not configured.",
      503,
      null,
    );
  }

  try {
    return new URL(configuredUrl).toString().replace(/\/$/, "");
  } catch {
    throw new BackendRequestError(
      "The backend API URL is invalid.",
      503,
      null,
    );
  }
}

function getRequestTimeoutMs(): number {
  const configuredTimeout = Number(process.env.BACKEND_REQUEST_TIMEOUT_MS);

  return Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_REQUEST_TIMEOUT_MS;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function backendRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const requestUrl = new URL(path, `${getBackendBaseUrl()}/`);

  let response: Response;

  try {
    response = await fetch(requestUrl, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(getRequestTimeoutMs()),
    });
  } catch {
    throw new BackendRequestError(
      "The backend service could not be reached.",
      503,
      null,
    );
  }

  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new BackendRequestError(
      "The backend request failed.",
      response.status,
      body,
    );
  }

  return body as T;
}
