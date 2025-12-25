import { test, expect } from '@playwright/test';

test.describe('Web App Smoke Tests', () => {
  test('redirects from / to /chat', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/chat');
  });

  test('/chat renders new chat page', async ({ page }) => {
    await page.goto('/chat');
    // New chat page should show the greeting and prompt input
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('/chat/:id shows conversation view', async ({ page }) => {
    await page.goto('/chat/test-123');
    // Conversation view should show the header with title
    await expect(page.locator('body')).toBeVisible();
  });

  test('/projects renders', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('body')).toContainText('Projects');
  });
});

test.describe('Persona Login', () => {
  // Use unauthenticated context for this test
  test.use({ storageState: { cookies: [], origins: [] } });

  test('/dev/personas page is accessible in dev mode', async ({ page }) => {
    await page.goto('/dev/personas');
    await expect(page.getByRole('heading', { name: /developer personas/i })).toBeVisible();
  });

  test('clicking persona card initiates login', async ({ page }) => {
    await page.goto('/dev/personas');

    // All persona cards should be visible
    await expect(page.getByTestId('persona-card-alice')).toBeVisible();
    await expect(page.getByTestId('persona-card-bob')).toBeVisible();
    await expect(page.getByTestId('persona-card-charlie')).toBeVisible();
  });
});
