export const API_URL = "https://pokeapi.co/api/v2/";

export const apiClient = async (
  endpoint: string,
  {
    body,
    params,
    ...customConfig
  }: RequestInit & { body?: object; params?: object } = {}
) => {
  const url = new URL(endpoint, API_URL);
  const headers = { "Content-Type": "application/json" };

  const config: RequestInit = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, encodeURIComponent(value));
    }
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(url.toString(), config);
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : undefined;

  if (!res.ok) {
    throw new Error("API ERROR: Oh no, someting is broken!");
  }

  return data;
};
