import { createLiveOrdersSlice } from './createLiveOrdersSlice';

export type { TWsOrdersData } from './createLiveOrdersSlice';

const { slice, connect, disconnect, wsActions } = createLiveOrdersSlice('feed');

export const feedConnect = connect;
export const feedDisconnect = disconnect;
export const feedWsActions = wsActions;

export const {
  selectOrders: selectFeedOrders,
  selectTotal: selectFeedTotal,
  selectTotalToday: selectFeedTotalToday,
  selectIsConnected: selectFeedIsConnected,
  selectError: selectFeedError
} = slice.selectors;

export default slice.reducer;
