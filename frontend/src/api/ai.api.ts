import apiClient from "./axios.instance";
import type { AskAiPayload, AskAiResponse } from "../types";

export const aiApi = {
  ask: async (payload: AskAiPayload): Promise<AskAiResponse> => {
    const response = await apiClient.post<AskAiResponse>("/ai/ask", payload);
    return response.data;
  },
};