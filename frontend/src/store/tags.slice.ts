import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Tag } from "../types";
import { tagsApi } from "../api/tags.api";

interface TagsState {
  items: Tag[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TagsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchTags = createAsyncThunk<
  Tag[],
  void,
  { rejectValue: string }
>("tags/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await tagsApi.getAll();
  } catch {
    return rejectWithValue("Failed to load tags");
  }
});

const tagsSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action: PayloadAction<Tag[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unknown error";
      });
  },
});

export default tagsSlice.reducer;