import { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';

export type TWsActionTypes<TPayload> = {
  connect: {
    match: (action: unknown) => action is { type: string; payload: string };
  };
  disconnect: { match: (action: unknown) => action is { type: string } };
  onOpen: () => { type: string };
  onClose: () => { type: string };
  onError: (message: string) => { type: string; payload: string };
  onMessage: (data: TPayload) => { type: string; payload: TPayload };
};

export const socketMiddleware = <TPayload>(
  wsActions: TWsActionTypes<TPayload>
): Middleware => {
  let socket: WebSocket | null = null;

  return (store: MiddlewareAPI) => (next) => (action) => {
    const { dispatch } = store;
    const { connect, disconnect, onOpen, onClose, onError, onMessage } =
      wsActions;

    if (connect.match(action)) {
      socket = new WebSocket(action.payload);

      socket.onopen = () => {
        dispatch(onOpen());
      };

      socket.onerror = () => {
        dispatch(onError('Ошибка соединения с сервером'));
      };

      socket.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as TPayload;
          dispatch(onMessage(data));
        } catch (e) {
          dispatch(onError('Не удалось обработать сообщение сервера'));
        }
      };

      socket.onclose = () => {
        dispatch(onClose());
        socket = null;
      };
    }

    if (disconnect.match(action)) {
      if (socket) {
        socket.close();
        socket = null;
      }
    }

    next(action);
  };
};
