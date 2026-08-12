import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { selectFeedOrders } from '../../services/selectors';
import { feedConnect, feedDisconnect } from '../../services/slices/feedSlice';
import { WS_URL } from '@api';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFeedOrders);

  useEffect(() => {
    dispatch(feedConnect(`${WS_URL}/orders/all`));
    return () => {
      dispatch(feedDisconnect());
    };
  }, [dispatch]);

  const handleGetFeeds = () => {
    dispatch(feedConnect(`${WS_URL}/orders/all`));
  };

  if (!orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
