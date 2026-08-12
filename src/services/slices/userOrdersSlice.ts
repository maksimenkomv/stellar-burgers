import { createAsyncThunk } from '@reduxjs/toolkit';
import { getOrdersApi } from '@api';
import { createLiveOrdersSlice } from './createLiveOrdersSlice';

// REST-запрос истории заказов пользователя. getOrdersApi уже обёрнут в
// fetchWithRefresh, поэтому именно он отвечает за обновление токена перед
// открытием WebSocket-соединения (см. profile-orders.tsx).
export const fetchUserOrders = createAsyncThunk('userOrders/fetch', async () =>
  getOrdersApi()
);

const { slice, connect, disconnect, wsActions } = createLiveOrdersSlice(
  'userOrders',
  (builder) => {
    builder.addCase(fetchUserOrders.fulfilled, (state, action) => {
      state.orders = action.payload;
    });
  }
);

export const userOrdersConnect = connect;
export const userOrdersDisconnect = disconnect;
export const userOrdersWsActions = wsActions;

export const {
  selectOrders: selectUserOrders,
  selectIsConnected: selectUserOrdersIsConnected,
  selectError: selectUserOrdersError
} = slice.selectors;

export default slice.reducer;
