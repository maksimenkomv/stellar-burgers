import { createAction, createSlice } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';

export type TWsOrdersData = {
  success: boolean;
  orders: TOrder[];
  total: number;
  totalToday: number;
};

type TFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isConnected: boolean;
  error: string | null;
};

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isConnected: false,
  error: null
};

export const feedConnect = createAction<string>('feed/connect');
export const feedDisconnect = createAction('feed/disconnect');
const feedConnectionSuccess = createAction('feed/connectionSuccess');
const feedConnectionClosed = createAction('feed/connectionClosed');
const feedConnectionError = createAction<string>('feed/connectionError');
const feedGetMessage = createAction<TWsOrdersData>('feed/getMessage');

export const feedWsActions = {
  connect: feedConnect,
  disconnect: feedDisconnect,
  onOpen: feedConnectionSuccess,
  onClose: feedConnectionClosed,
  onError: feedConnectionError,
  onMessage: feedGetMessage
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  selectors: {
    selectFeedOrders: (state) => state.orders,
    selectFeedTotal: (state) => state.total,
    selectFeedTotalToday: (state) => state.totalToday,
    selectFeedIsConnected: (state) => state.isConnected,
    selectFeedError: (state) => state.error
  },
  extraReducers: (builder) => {
    builder
      .addCase(feedConnectionSuccess, (state) => {
        state.isConnected = true;
        state.error = null;
      })
      .addCase(feedConnectionClosed, (state) => {
        state.isConnected = false;
      })
      .addCase(feedConnectionError, (state, action) => {
        state.isConnected = false;
        state.error = action.payload;
      })
      .addCase(feedGetMessage, (state, action) => {
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      });
  }
});

export const {
  selectFeedOrders,
  selectFeedTotal,
  selectFeedTotalToday,
  selectFeedIsConnected,
  selectFeedError
} = feedSlice.selectors;

export default feedSlice.reducer;
