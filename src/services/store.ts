import { combineReducers, configureStore } from '@reduxjs/toolkit';

import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';

import {
  ingredientsReducer,
  burgerConstructorReducer,
  orderReducer,
  feedReducer,
  userOrdersReducer,
  userReducer,
  feedWsActions,
  userOrdersWsActions
} from './slices';

import { socketMiddleware } from './middleware/socketMiddleware';
import { TWsOrdersData } from './slices/feedSlice';

const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: burgerConstructorReducer,
  order: orderReducer,
  feed: feedReducer,
  userOrders: userOrdersReducer,
  user: userReducer
});

const feedSocketMiddleware = socketMiddleware<TWsOrdersData>(feedWsActions);
const userOrdersSocketMiddleware =
  socketMiddleware<TWsOrdersData>(userOrdersWsActions);

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      feedSocketMiddleware,
      userOrdersSocketMiddleware
    ),
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export const useDispatch: () => AppDispatch = () => dispatchHook();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

export default store;
