import apiClient from "./axios.instance";
import type { Tag } from "../types";

export const tagsApi = {
  getAll: async (): Promise<Tag[]> => {
    const response = await apiClient.get<Tag[]>("/tags");
    return response.data;
  },
};