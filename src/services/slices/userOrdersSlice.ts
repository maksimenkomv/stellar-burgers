import { createAction, createSlice } from '@reduxjs/toolkit';
import { TWsOrdersData } from './feedSlice';

type TUserOrdersState = {
  orders: TWsOrdersData['orders'];
  isConnected: boolean;
  error: string | null;
};

const initialState: TUserOrdersState = {
  orders: [],
  isConnected: false,
  error: null
};

export const userOrdersConnect = createAction<string>('userOrders/connect');
export const userOrdersDisconnect = createAction('userOrders/disconnect');
const userOrdersConnectionSuccess = createAction(
  'userOrders/connectionSuccess'
);
const userOrdersConnectionClosed = createAction('userOrders/connectionClosed');
const userOrdersConnectionError = createAction<string>(
  'userOrders/connectionError'
);
const userOrdersGetMessage = createAction<TWsOrdersData>(
  'userOrders/getMessage'
);

export const userOrdersWsActions = {
  connect: userOrdersConnect,
  disconnect: userOrdersDisconnect,
  onOpen: userOrdersConnectionSuccess,
  onClose: userOrdersConnectionClosed,
  onError: userOrdersConnectionError,
  onMessage: userOrdersGetMessage
};

const userOrdersSlice = createSlice({
  name: 'userOrders',
  initialState,
  reducers: {},
  selectors: {
    selectUserOrders: (state) => state.orders,
    selectUserOrdersIsConnected: (state) => state.isConnected,
    selectUserOrdersError: (state) => state.error
  },
  extraReducers: (builder) => {
    builder
      .addCase(userOrdersConnectionSuccess, (state) => {
        state.isConnected = true;
        state.error = null;
      })
      .addCase(userOrdersConnectionClosed, (state) => {
        state.isConnected = false;
      })
      .addCase(userOrdersConnectionError, (state, action) => {
        state.isConnected = false;
        state.error = action.payload;
      })
      .addCase(userOrdersGetMessage, (state, action) => {
        state.orders = action.payload.orders;
      });
  }
});

export const {
  selectUserOrders,
  selectUserOrdersIsConnected,
  selectUserOrdersError
} = userOrdersSlice.selectors;

export default userOrdersSlice.reducer;
