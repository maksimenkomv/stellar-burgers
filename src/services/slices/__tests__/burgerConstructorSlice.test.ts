import burgerConstructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown,
  clearConstructor
} from '../burgerConstructorSlice';
import { TConstructorIngredient, TIngredient } from '@utils-types';

jest.mock('@reduxjs/toolkit', () => {
  const actual = jest.requireActual('@reduxjs/toolkit');
  return {
    ...actual,
    nanoid: () => 'test-id'
  };
});

const bun: TIngredient = {
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
};

const sauce: TIngredient = {
  _id: 'sauce-1',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'https://example.com/sauce.png',
  image_large: 'https://example.com/sauce-large.png',
  image_mobile: 'https://example.com/sauce-mobile.png'
};

const main: TIngredient = {
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
};

const constructorSauce: TConstructorIngredient = { ...sauce, id: 'sauce-key' };
const constructorMain: TConstructorIngredient = { ...main, id: 'main-key' };

const initialState = {
  bun: null,
  ingredients: []
};

describe('редьюсер burgerConstructorSlice', () => {
  test('должен вернуть начальное состояние при неизвестном экшене и state undefined', () => {
    const state = burgerConstructorReducer(undefined, {
      type: 'UNKNOWN_ACTION'
    });
    expect(state).toEqual(initialState);
  });

  test('должен вернуть состояние без изменений при неизвестном экшене', () => {
    const startState = {
      bun: null,
      ingredients: [constructorSauce]
    };
    const state = burgerConstructorReducer(startState, {
      type: 'UNKNOWN_ACTION'
    });
    expect(state).toEqual(startState);
  });

  test('addIngredient должен положить булку в поле bun', () => {
    const state = burgerConstructorReducer(initialState, addIngredient(bun));

    expect(state.bun).toEqual({ ...bun, id: 'test-id' });
    expect(state.ingredients).toHaveLength(0);
  });

  test('addIngredient должен добавить начинку/соус в конец массива ingredients', () => {
    const startState = {
      bun: null,
      ingredients: [constructorSauce]
    };

    const state = burgerConstructorReducer(startState, addIngredient(main));

    expect(state.ingredients).toHaveLength(2);
    expect(state.ingredients[0]).toEqual(constructorSauce);
    expect(state.ingredients[1]).toEqual({ ...main, id: 'test-id' });
    expect(state.bun).toBeNull();
  });

  test('removeIngredient должен удалить ингредиент по id', () => {
    const startState = {
      bun: null,
      ingredients: [constructorSauce, constructorMain]
    };

    const state = burgerConstructorReducer(
      startState,
      removeIngredient(constructorSauce.id)
    );

    expect(state.ingredients).toEqual([constructorMain]);
  });

  test('removeIngredient не должен ничего менять, если id не найден', () => {
    const startState = {
      bun: null,
      ingredients: [constructorSauce]
    };

    const state = burgerConstructorReducer(
      startState,
      removeIngredient('несуществующий-id')
    );

    expect(state.ingredients).toEqual([constructorSauce]);
  });

  test('moveIngredientUp должен поменять местами ингредиент с предыдущим', () => {
    const startState = {
      bun: null,
      ingredients: [constructorSauce, constructorMain]
    };

    const state = burgerConstructorReducer(startState, moveIngredientUp(1));

    expect(state.ingredients).toEqual([constructorMain, constructorSauce]);
  });

  test('moveIngredientUp не должен ничего менять для первого элемента (index <= 0)', () => {
    const startState = {
      bun: null,
      ingredients: [constructorSauce, constructorMain]
    };

    const state = burgerConstructorReducer(startState, moveIngredientUp(0));

    expect(state.ingredients).toEqual([constructorSauce, constructorMain]);
  });

  test('moveIngredientDown должен поменять местами ингредиент со следующим', () => {
    const startState = {
      bun: null,
      ingredients: [constructorSauce, constructorMain]
    };

    const state = burgerConstructorReducer(startState, moveIngredientDown(0));

    expect(state.ingredients).toEqual([constructorMain, constructorSauce]);
  });

  test('moveIngredientDown не должен ничего менять для последнего элемента', () => {
    const startState = {
      bun: null,
      ingredients: [constructorSauce, constructorMain]
    };

    const state = burgerConstructorReducer(startState, moveIngredientDown(1));

    expect(state.ingredients).toEqual([constructorSauce, constructorMain]);
  });

  test('clearConstructor должен очистить булку и список ингредиентов', () => {
    const startState = {
      bun: { ...bun, id: 'bun-key' },
      ingredients: [constructorSauce, constructorMain]
    };

    const state = burgerConstructorReducer(startState, clearConstructor());

    expect(state).toEqual(initialState);
  });
});
