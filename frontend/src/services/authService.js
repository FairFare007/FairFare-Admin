import { apiRequest } from "../utils/api";

export const adminLogin = (email, password) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};
