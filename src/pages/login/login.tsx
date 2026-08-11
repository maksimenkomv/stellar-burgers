import { FC, SyntheticEvent, useState } from 'react';
import { LoginUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store';
import { selectLoginError } from '../../services/selectors';
import { loginUser } from '../../services/slices/userSlice';

export const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const errorText = useSelector(selectLoginError);

  // Редирект после входа делает ProtectedRoute (onlyUnAuth): как только
  // пользователь появляется в сторе, он сам перенаправит на from ?? '/'.
  // Ручной navigate() здесь давал гонку из двух редиректов подряд.
  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <LoginUI
      errorText={errorText ?? undefined}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
