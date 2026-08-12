import path from 'path';
import { test, expect, Page } from '@playwright/test';

// Идентификаторы и данные ингредиентов должны совпадать с моковыми
// данными в tests/hars/ingredients.har, чтобы тесты были детерминированы.
const BUN_ID = '643d69a5c3f7b9001cfa093d';
const BUN_NAME = 'Краторная булка N-200i';
const MAIN_ID = '643d69a5c3f7b9001cfa0941';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';

// Номер заказа возвращается моком tests/hars/order.har и должен совпадать
// с постдатой в этом же файле (bun -> main -> bun).
const ORDER_NUMBER = '45678';

const hars = {
  ingredients: path.join(__dirname, 'hars', 'ingredients.har'),
  user: path.join(__dirname, 'hars', 'user.har'),
  order: path.join(__dirname, 'hars', 'order.har')
};

const ingredientCard = (page: Page, id: string) =>
  page
    .locator('li')
    .filter({ has: page.locator(`a[href="/ingredients/${id}"]`) });

const addIngredientByCard = async (page: Page, id: string) => {
  await ingredientCard(page, id)
    .getByRole('button', { name: 'Добавить' })
    .click();
};

const modal = (page: Page) => page.locator('#modals > div').first();
const overlay = (page: Page) => page.locator('#modals > div').last();

// Название ингредиента в списке ингредиентов и в конструкторе — один и тот
// же текст, поэтому для проверки содержимого конструктора берём именно
// текст внутри ConstructorElement (стабильный класс из UI-кита), а не
// текст на странице целиком.
const constructorElementText = (page: Page, text: string) =>
  page.locator('.constructor-element__text').filter({ hasText: text });

test.describe('Страница конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    // Перехватываем все запросы к бэкенду через заранее записанные HAR-файлы.
    await page.routeFromHAR(hars.ingredients, {
      url: '**/api/ingredients',
      update: false
    });
    await page.routeFromHAR(hars.user, {
      url: '**/api/auth/user',
      update: false
    });
  });

  const gotoConstructorPage = async (page: Page) => {
    await page.goto('/');
    await expect(ingredientCard(page, BUN_ID)).toBeVisible();
  };

  test.describe('добавление ингредиентов в конструктор', () => {
    test('добавление булки из списка добавляет её в конструктор', async ({
      page
    }) => {
      await gotoConstructorPage(page);
      await addIngredientByCard(page, BUN_ID);

      await expect(
        constructorElementText(page, `${BUN_NAME} (верх)`)
      ).toBeVisible();
      await expect(
        constructorElementText(page, `${BUN_NAME} (низ)`)
      ).toBeVisible();
    });

    test('добавление начинки из списка добавляет её в конструктор', async ({
      page
    }) => {
      await gotoConstructorPage(page);
      await addIngredientByCard(page, MAIN_ID);

      await expect(constructorElementText(page, MAIN_NAME)).toBeVisible();
    });

    test('можно собрать бургер из булки и начинки', async ({ page }) => {
      await gotoConstructorPage(page);
      await addIngredientByCard(page, BUN_ID);
      await addIngredientByCard(page, MAIN_ID);

      await expect(
        constructorElementText(page, `${BUN_NAME} (верх)`)
      ).toBeVisible();
      await expect(
        constructorElementText(page, `${BUN_NAME} (низ)`)
      ).toBeVisible();
      await expect(constructorElementText(page, MAIN_NAME)).toBeVisible();
    });
  });

  test.describe('модальное окно ингредиента', () => {
    test('открывается по клику на ингредиент и показывает его данные', async ({
      page
    }) => {
      await gotoConstructorPage(page);
      await ingredientCard(page, MAIN_ID).locator('a').click();

      await expect(page).toHaveURL(`/ingredients/${MAIN_ID}`);
      await expect(modal(page)).toBeVisible();
      await expect(modal(page)).toContainText(MAIN_NAME);
    });

    test('показывает данные именно того ингредиента, по которому кликнули', async ({
      page
    }) => {
      await gotoConstructorPage(page);
      await ingredientCard(page, BUN_ID).locator('a').click();
      await expect(modal(page)).toContainText(BUN_NAME);
      await expect(modal(page)).not.toContainText(MAIN_NAME);
    });

    test('закрывается по клику на крестик', async ({ page }) => {
      await gotoConstructorPage(page);
      await ingredientCard(page, MAIN_ID).locator('a').click();
      await expect(modal(page)).toBeVisible();

      await page.locator('#modals svg').click();

      await expect(page).toHaveURL('/');
      await expect(page.locator('#modals')).toBeEmpty();
    });

    test('закрывается по клику на оверлей', async ({ page }) => {
      await gotoConstructorPage(page);
      await ingredientCard(page, MAIN_ID).locator('a').click();
      await expect(modal(page)).toBeVisible();

      // Кликаем в угол оверлея, чтобы не попасть в перекрывающую его карточку модалки.
      await overlay(page).click({ position: { x: 5, y: 5 } });

      await expect(page).toHaveURL('/');
      await expect(page.locator('#modals')).toBeEmpty();
    });
  });

  test.describe('создание заказа', () => {
    test.beforeEach(async ({ page, context }) => {
      await page.routeFromHAR(hars.order, {
        url: '**/api/orders',
        update: false
      });

      // Подставляем фейковые токены авторизации в cookie и localStorage.
      await context.addCookies([
        {
          name: 'accessToken',
          value: 'Bearer fake-access-token',
          url: 'http://localhost:4000'
        }
      ]);
      await page.addInitScript(() => {
        window.localStorage.setItem('refreshToken', 'fake-refresh-token');
      });

      await gotoConstructorPage(page);
    });

    test('оформление заказа показывает верный номер и очищает конструктор', async ({
      page
    }) => {
      await addIngredientByCard(page, BUN_ID);
      await addIngredientByCard(page, MAIN_ID);

      await page.getByRole('button', { name: 'Оформить заказ' }).click();

      await expect(modal(page)).toBeVisible();
      await expect(modal(page)).toContainText(ORDER_NUMBER);

      // Конструктор должен вернуться в пустое состояние.
      await expect(page.getByText('Выберите булки')).toHaveCount(2);
      await expect(page.getByText('Выберите начинку')).toHaveCount(1);

      await page.locator('#modals svg').click();

      await expect(page.locator('#modals')).toBeEmpty();
    });
  });
});
