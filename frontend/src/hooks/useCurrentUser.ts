import { useSelector } from "react-redux";
import type { RootState } from "../store";
import type { User } from "../types";

export const useCurrentUser = (): User | null => {
  return useSelector((state: RootState) => state.auth.user);
};
