export async function apiFetch(url: string, options: RequestInit = {}) {
  // Disable caching for all API calls to ensure data freshness
  const fetchOptions: RequestInit = {
    ...options,
    cache: 'no-store',
    headers: {
      ...options.headers,
    }
  };

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (networkError: any) {
    console.error("Network error during fetch:", url, networkError);
    throw new Error("Connection failed. Please check your internet and try again.");
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  // We read as text first to avoid the "Unexpected token <" crash and allow better debugging
  const rawText = await response.text();

  if (isJson) {
    let data;
    try {
      if (!rawText || rawText.trim() === "") {
        throw new Error("Empty response from server");
      }
      data = JSON.parse(rawText);
    } catch (e) {
      console.error("JSON Parse Error at " + url, { status: response.status, preview: rawText.substring(0, 200) });
      if (rawText.trim().startsWith("<!DOCTYPE") || rawText.trim().startsWith("<html")) {
        throw new Error("The server returned an HTML error page. This usually means a server-side crash.");
      }
      throw new Error(`Invalid response format from server (${response.status})`);
    }

    if (!response.ok) {
      const msg = data.error || data.message || `Error ${response.status}: Request failed.`;
      const err = new Error(msg);
      if (data.details) {
        (err as any).details = data.details;
      }
      throw err;
    }
    return data;
  } else {
    // Non-JSON response handling
    console.error("Unexpected Non-JSON Response at " + url, {
      status: response.status,
      contentType,
      preview: rawText.substring(0, 200)
    });

    if (response.status === 404) {
      throw new Error(`The API endpoint "${url}" was not found (404).`);
    }

    if (rawText.trim().startsWith("<!DOCTYPE")) {
      throw new Error("The server is currently unavailable or returned a technical error page.");
    }

    throw new Error(rawText || `Server returned an error (${response.status}).`);
  }
}
