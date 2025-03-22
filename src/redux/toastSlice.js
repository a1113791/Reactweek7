import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    PushMessage(state, action) {
      const { text, status } = action.payload;
      const id = Date.now();

      state.messages.push({
        id,
        text,
        status,
      });
    },
  },
});

export const { pushMessage } = toastSlice.actions;

export default toastSlice.reducer;
