import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
// import { handleError } from "../../hooks/handleError";

axios.defaults.baseURL = "https://readjourney.b.goit.study/api";
const setAuthHeader = (token: string): void => {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};
const clearAuthHeader = (): void => {
  axios.defaults.headers.common["Authorization"] = ``;
};
