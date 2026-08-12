import {
  ActionReducerMapBuilder,
  createAction,
  createSlice
} from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';

export type TWsOrdersData = {
  success: boolean;
  orders: TOrder[];
  total: number;
  totalToday: number;
};

export type TLiveOrdersState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isConnected: boolean;
  error: string | null;
};

const initialState: TLiveOrdersState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isConnected: false,
  error: null
};

/**
 * Общая фабрика для слайсов, обновляющихся по WebSocket (лента заказов и
 * история заказов пользователя). Убирает дублирование экшенов/редьюсеров
 * между feedSlice и userOrdersSlice. Через `extend` можно добавить
 * дополнительные extraReducers (например, обычный REST-thunk).
 */
export const createLiveOrdersSlice = <Name extends string>(
  name: Name,
  extend?: (builder: ActionReducerMapBuilder<TLiveOrdersState>) => void
) => {
  const connect = createAction<string>(`${name}/connect`);
  const disconnect = createAction(`${name}/disconnect`);
  const connectionSuccess = createAction(`${name}/connectionSuccess`);
  const connectionClosed = createAction(`${name}/connectionClosed`);
  const connectionError = createAction<string>(`${name}/connectionError`);
  const getMessage = createAction<TWsOrdersData>(`${name}/getMessage`);

  const slice = createSlice({
    name,
    initialState,
    reducers: {},
    selectors: {
      selectOrders: (state) => state.orders,
      selectTotal: (state) => state.total,
      selectTotalToday: (state) => state.totalToday,
      selectIsConnected: (state) => state.isConnected,
      selectError: (state) => state.error
    },
    extraReducers: (builder) => {
      builder
        .addCase(connectionSuccess, (state) => {
          state.isConnected = true;
          state.error = null;
        })
        .addCase(connectionClosed, (state) => {
          state.isConnected = false;
        })
        .addCase(connectionError, (state, action) => {
          state.isConnected = false;
          state.error = action.payload;
        })
        .addCase(getMessage, (state, action) => {
          state.orders = action.payload.orders;
          state.total = action.payload.total;
          state.totalToday = action.payload.totalToday;
        });

      extend?.(builder);
    }
  });

  const wsActions = {
    connect,
    disconnect,
    onOpen: connectionSuccess,
    onClose: connectionClosed,
    onError: connectionError,
    onMessage: getMessage
  };

  return { slice, connect, disconnect, wsActions };
};
