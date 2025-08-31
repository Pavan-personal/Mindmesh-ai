import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return "/default-avatar.png";

  if (
    imageUrl.includes("googleusercontent.com") ||
    imageUrl.includes("google.com")
  ) {
    return `${API_URL}/proxy-image?url=${encodeURIComponent(imageUrl)}`;
  }

  return imageUrl;
};
