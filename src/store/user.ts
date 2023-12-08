import { createSlice } from "@reduxjs/toolkit";
//
interface UserState {
  token: string;
  info: any;
}

const initialState: UserState = {
  token: "",
  info: null,
};
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // 登录方法
    login: (state, { payload }) => {
      state.token = payload.token;
      state.info = payload.info;
    },
    logout: (state) => {
      state.token = "";
      state.info = null;
    },
  },
});
// 导出登录和退出方法
export const { login, logout } = userSlice.actions;
// 默认导出reducer
export default userSlice.reducer;
