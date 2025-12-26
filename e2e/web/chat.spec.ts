import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
  test.describe('New Chat', () => {
    test('displays new chat page with greeting and input', async ({ page }) => {
      await page.goto('/chat');

      // Should show the new chat page component
      await expect(page.getByTestId('new-chat-page')).toBeVisible();

      // Should have a textarea for input (the main chat input, not sidebar search)
      await expect(page.getByRole('textbox', { name: 'Ask me anything...' })).toBeVisible();

      // Should have suggestion chips
      await expect(page.getByText('Need inspiration? Try these:')).toBeVisible();
    });

    test('creates conversation when sending first message', async ({ page }) => {
      await page.goto('/chat');

      // Type a message (use specific placeholder to avoid sidebar search input)
      const input = page.getByRole('textbox', { name: 'Ask me anything...' });
      await input.fill('Hello, this is a test message');

      // Submit the message
      await page.getByRole('button', { name: 'Send' }).click();

      // Should navigate to a conversation page with a UUID in the URL
      await expect(page).toHaveURL(/\/chat\/[a-f0-9-]+$/);

      // Should show the message we sent
      await expect(page.getByText('Hello, this is a test message')).toBeVisible();
    });
  });

  test.describe('Existing Conversation', () => {
    // Create a conversation before each test
    test.beforeEach(async ({ page }) => {
      await page.goto('/chat');
      const input = page.getByRole('textbox', { name: 'Ask me anything...' });
      await input.fill('Setup message for existing conversation test');
      await page.getByRole('button', { name: 'Send' }).click();
      await expect(page).toHaveURL(/\/chat\/[a-f0-9-]+$/);
    });

    test('displays existing conversation with messages', async ({ page }) => {
      // Should show the message input at the bottom
      const messageInput = page.getByPlaceholder(/message/i);
      await expect(messageInput).toBeVisible();

      // Should show the original message
      await expect(page.getByText('Setup message for existing conversation test')).toBeVisible();
    });

    test('can send additional messages', async ({ page }) => {
      // Send another message
      const input = page.getByPlaceholder(/message/i);
      await input.fill('This is a follow-up message');

      // Use force click to bypass any overlay elements like React Query DevTools
      await page.getByRole('button', { name: /send/i }).click({ force: true });

      // Both messages should be visible
      await expect(page.getByText('Setup message for existing conversation test')).toBeVisible();
      await expect(page.getByText('This is a follow-up message')).toBeVisible();
    });
  });

  test.describe('Sidebar Actions', () => {
    // Create a unique conversation before each test and store the URL
    let conversationUrl: string;
    const testMessage = `Unique sidebar test ${String(Date.now())}`;

    test.beforeEach(async ({ page }) => {
      await page.goto('/chat');
      const input = page.getByRole('textbox', { name: 'Ask me anything...' });
      await input.fill(testMessage);
      await page.getByRole('button', { name: 'Send' }).click();
      await expect(page).toHaveURL(/\/chat\/[a-f0-9-]+$/);
      conversationUrl = page.url();
    });

    test('shows conversation in sidebar', async ({ page }) => {
      // Get the conversation ID from the URL
      const conversationId = conversationUrl.split('/').pop() ?? '';
      // The sidebar should show a link to our conversation
      await expect(page.locator(`a[href="/chat/${conversationId}"]`)).toBeVisible();
    });

    test('can rename conversation via dropdown menu', async ({ page }) => {
      // Get the conversation ID from the URL
      const conversationId = conversationUrl.split('/').pop() ?? '';
      // Find the specific chat item link
      const chatLink = page.locator(`a[href="/chat/${conversationId}"]`);

      // Hover over the chat item to reveal more button (hover on parent)
      const chatItemContainer = chatLink.locator('..');
      await chatItemContainer.hover();

      // Click the more options button within this container
      await chatItemContainer.getByTestId('chat-item-more-button').click();

      // Click Rename option (use menuitem role to be specific)
      await page.getByRole('menuitem', { name: 'Rename' }).click();

      // Dialog should appear
      await expect(page.getByText('Rename conversation')).toBeVisible();

      // Type new name
      const renameInput = page.locator('input[placeholder="Conversation title"]');
      await renameInput.clear();
      await renameInput.fill('My Renamed Conversation');

      // Save
      await page.getByTestId('save-rename-button').click();

      // Dialog should close and sidebar should show new name
      await expect(page.getByText('Rename conversation')).not.toBeVisible();
      // Check sidebar specifically for the new name
      await expect(
        page.locator(`a[href="/chat/${conversationId}"]`).getByText('My Renamed Conversation')
      ).toBeVisible();
    });

    test('can delete conversation via dropdown menu', async ({ page }) => {
      // Get the conversation ID from the URL
      const conversationId = conversationUrl.split('/').pop() ?? '';
      // Find the specific chat item link
      const chatLink = page.locator(`a[href="/chat/${conversationId}"]`);

      // Hover over the chat item to reveal more button (hover on parent)
      const chatItemContainer = chatLink.locator('..');
      await chatItemContainer.hover();

      // Click the more options button within this container
      await chatItemContainer.getByTestId('chat-item-more-button').click();

      // Click Delete option (use menuitem role to be specific)
      await page.getByRole('menuitem', { name: 'Delete' }).click();

      // Confirmation dialog should appear
      await expect(page.getByText('Delete conversation?')).toBeVisible();

      // Confirm deletion
      await page.getByTestId('confirm-delete-button').click();

      // Should navigate back to /chat (new chat page)
      await expect(page).toHaveURL('/chat');

      // New chat page should be visible
      await expect(page.getByTestId('new-chat-page')).toBeVisible();
    });

    test('can cancel delete confirmation', async ({ page }) => {
      // Get the conversation ID from the URL
      const conversationId = conversationUrl.split('/').pop() ?? '';
      // Find the specific chat item link
      const chatLink = page.locator(`a[href="/chat/${conversationId}"]`);

      // Hover over the chat item to reveal more button (hover on parent)
      const chatItemContainer = chatLink.locator('..');
      await chatItemContainer.hover();

      // Click the more options button within this container
      await chatItemContainer.getByTestId('chat-item-more-button').click();

      // Click Delete option (use menuitem role to be specific)
      await page.getByRole('menuitem', { name: 'Delete' }).click();

      // Confirmation dialog should appear
      await expect(page.getByText('Delete conversation?')).toBeVisible();

      // Cancel deletion
      await page.getByTestId('cancel-delete-button').click();

      // Dialog should close
      await expect(page.getByText('Delete conversation?')).not.toBeVisible();

      // Should still be on the same URL
      await expect(page).toHaveURL(conversationUrl);
    });
  });
});
