import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  TLoginData,
  TRegisterData,
  updateUserApi
} from '@api';
import { TUser } from '@utils-types';
import { deleteCookie, setCookie } from '../../utils/cookie';

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  loginError: string | null;
  registerError: string | null;
  updateUserError: string | null;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  loginError: null,
  registerError: null,
  updateUserError: null
};

const setAuthData = (accessToken: string, refreshToken: string) => {
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const registerUser = createAsyncThunk(
  'user/register',
  async (data: TRegisterData) => {
    const response = await registerUserApi(data);
    setAuthData(response.accessToken, response.refreshToken);
    return response.user;
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async (data: TLoginData) => {
    const response = await loginUserApi(data);
    setAuthData(response.accessToken, response.refreshToken);
    return response.user;
  }
);

export const checkUserAuth = createAsyncThunk(
  'user/checkAuth',
  async (_, { dispatch }) => {
    try {
      const response = await getUserApi();
      return response.user;
    } finally {
      dispatch(authChecked());
    }
  }
);

export const logoutUser = createAsyncThunk('user/logout', async () => {
  await logoutApi();
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
});

export const updateUser = createAsyncThunk(
  'user/update',
  async (data: Partial<TRegisterData>) => {
    const response = await updateUserApi(data);
    return response.user;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authChecked: (state) => {
      state.isAuthChecked = true;
    }
  },
  selectors: {
    selectUser: (state) => state.user,
    selectIsAuthChecked: (state) => state.isAuthChecked,
    selectIsAuthenticated: (state) => Boolean(state.user),
    selectLoginError: (state) => state.loginError,
    selectRegisterError: (state) => state.registerError,
    selectUpdateUserError: (state) => state.updateUserError
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerError =
          action.error.message ?? 'Не удалось зарегистрироваться';
      })
      .addCase(loginUser.pending, (state) => {
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginError = action.error.message ?? 'Не удалось войти';
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.user = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(updateUser.pending, (state) => {
        state.updateUserError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateUserError =
          action.error.message ?? 'Не удалось обновить данные';
      });
  }
});

export const { authChecked } = userSlice.actions;

export const {
  selectUser,
  selectIsAuthChecked,
  selectIsAuthenticated,
  selectLoginError,
  selectRegisterError,
  selectUpdateUserError
} = userSlice.selectors;

export default userSlice.reducer;
