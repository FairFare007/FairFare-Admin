let accessToken = null;

const setAccessToken = (token) => {
  accessToken = token;
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Refresh token expired");
  }

  const data = await res.json();
  accessToken = data.accessToken;
  return accessToken;
};

export const apiRequest = async (url, options = {}) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      ...options,
    });

    if (res.status === 401) {
      await refreshAccessToken();

      return apiRequest(url, options);
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error) {
    localStorage.removeItem("refreshToken");
    accessToken = null;
    window.location.href = "/login";
  }
};

export { setAccessToken };
