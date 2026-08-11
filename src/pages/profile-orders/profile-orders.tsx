import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { selectUserOrders } from '../../services/selectors';
import {
  userOrdersConnect,
  userOrdersDisconnect
} from '../../services/slices/userOrdersSlice';
import { WS_URL } from '@api';
import { getCookie } from '../../utils/cookie';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectUserOrders);

  useEffect(() => {
    const accessToken = (getCookie('accessToken') || '').replace('Bearer ', '');
    dispatch(userOrdersConnect(`${WS_URL}/orders?token=${accessToken}`));
    return () => {
      dispatch(userOrdersDisconnect());
    };
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
