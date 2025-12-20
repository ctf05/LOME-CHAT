import { test, expect } from '@playwright/test';

test.describe('Web App Smoke Tests', () => {
  test('redirects from / to /chat', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/chat');
  });

  test('/chat renders chat index content', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.locator('body')).toContainText('Chat');
  });

  test('/chat/:id shows conversation ID', async ({ page }) => {
    await page.goto('/chat/test-123');
    await expect(page.locator('body')).toContainText('Conversation: test-123');
  });

  test('/projects renders', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('body')).toContainText('Projects');
  });

  test('/settings renders', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('body')).toContainText('Settings');
  });
});
