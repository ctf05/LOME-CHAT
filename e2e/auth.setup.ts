import { test as setup, expect } from '@playwright/test';
import type { DevPersonasResponse, DevPersona } from '@lome-chat/shared';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authDir = path.join(__dirname, '.auth');
const API_URL = 'http://localhost:8787';

// Ensure auth directory exists
setup.beforeAll(() => {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
});

/**
 * Extracts the persona name from email (e.g., alice@dev.lome-chat.com → alice)
 */
function getPersonaName(persona: DevPersona): string {
  const match = /^([^@]+)@/.exec(persona.email);
  return match?.[1] ?? persona.id;
}

/**
 * Fetches personas from the API
 */
async function fetchPersonas(): Promise<DevPersona[]> {
  const response = await fetch(`${API_URL}/dev/personas`);
  if (!response.ok) {
    throw new Error(`Failed to fetch personas: ${String(response.status)}`);
  }
  const data = (await response.json()) as DevPersonasResponse;
  return data.personas;
}

// Setup test that authenticates each verified persona
setup('authenticate all personas', async ({ page }) => {
  // Fetch personas from API
  const personas = await fetchPersonas();

  // Only authenticate verified personas (unverified cannot log in)
  const verifiedPersonas = personas.filter((persona) => persona.emailVerified);

  expect(verifiedPersonas.length).toBeGreaterThan(0);

  for (const persona of verifiedPersonas) {
    const personaName = getPersonaName(persona);

    // Navigate to personas page
    await page.goto('/dev/personas');

    // Wait for personas to load
    await page.waitForSelector(`[data-persona="${persona.id}"]`);

    // Click the persona card
    await page.click(`[data-persona="${persona.id}"]`);

    // Wait for navigation to /chat (successful login) or error message
    try {
      await page.waitForURL('/chat', { timeout: 15000 });
    } catch {
      // If we didn't navigate, check for error state
      const pageContent = await page.content();
      console.error(`Login failed for ${personaName}. Page content:`, pageContent.slice(0, 1000));
      throw new Error(`Login failed for ${personaName} - did not navigate to /chat`);
    }

    // Save storage state for this persona
    await page.context().storageState({ path: path.join(authDir, `${personaName}.json`) });

    // Clear storage state for next persona
    await page.context().clearCookies();
  }
});
