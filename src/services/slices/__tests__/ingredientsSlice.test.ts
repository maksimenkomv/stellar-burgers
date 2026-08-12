import ingredientsReducer, { fetchIngredients } from '../ingredientsSlice';
import { TIngredient } from '@utils-types';

const testIngredients: TIngredient[] = [
  {
    _id: 'bun-1',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://example.com/bun.png',
    image_large: 'https://example.com/bun-large.png',
    image_mobile: 'https://example.com/bun-mobile.png'
  },
  {
    _id: 'main-1',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://example.com/main.png',
    image_large: 'https://example.com/main-large.png',
    image_mobile: 'https://example.com/main-mobile.png'
  }
];

describe('редьюсер ingredientsSlice', () => {
  const initialState = {
    items: [],
    isLoading: false,
    error: null
  };

  test('должен вернуть начальное состояние при неизвестном экшене', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN_ACTION' });
    expect(state).toEqual(initialState);
  });

  test('должен обработать неизвестный экшен при заданном состоянии', () => {
    const state = ingredientsReducer(
      { items: testIngredients, isLoading: false, error: null },
      { type: 'UNKNOWN_ACTION' }
    );
    expect(state).toEqual({
      items: testIngredients,
      isLoading: false,
      error: null
    });
  });

  test('должен выставить isLoading в true и сбросить error при fetchIngredients.pending', () => {
    const startState = {
      items: [],
      isLoading: false,
      error: 'предыдущая ошибка'
    };

    const state = ingredientsReducer(
      startState,
      fetchIngredients.pending('requestId', undefined)
    );

    expect(state).toEqual({
      items: [],
      isLoading: true,
      error: null
    });
  });

  test('должен записать ингредиенты и сбросить isLoading при fetchIngredients.fulfilled', () => {
    const startState = {
      items: [],
      isLoading: true,
      error: null
    };

    const state = ingredientsReducer(
      startState,
      fetchIngredients.fulfilled(testIngredients, 'requestId', undefined)
    );

    expect(state).toEqual({
      items: testIngredients,
      isLoading: false,
      error: null
    });
  });

  test('должен записать текст ошибки и сбросить isLoading при fetchIngredients.rejected', () => {
    const startState = {
      items: [],
      isLoading: true,
      error: null
    };

    const state = ingredientsReducer(
      startState,
      fetchIngredients.rejected(
        new Error('Сеть недоступна'),
        'requestId',
        undefined
      )
    );

    expect(state).toEqual({
      items: [],
      isLoading: false,
      error: 'Сеть недоступна'
    });
  });

  test('должен использовать текст по умолчанию при fetchIngredients.rejected без сообщения об ошибке', () => {
    const state = ingredientsReducer(
      { items: [], isLoading: true, error: null },
      { type: fetchIngredients.rejected.type, error: {} }
    );

    expect(state.error).toBe('Не удалось загрузить ингредиенты');
  });
});
