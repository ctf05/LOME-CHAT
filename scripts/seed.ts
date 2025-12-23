import { eq } from 'drizzle-orm';
import { config } from 'dotenv';
import { resolve } from 'path';

import {
  createDb,
  LOCAL_NEON_DEV_CONFIG,
  users,
  conversations,
  messages,
  projects,
  accounts,
  hashPassword,
} from '@lome-chat/db';
import {
  userFactory,
  conversationFactory,
  messageFactory,
  projectFactory,
} from '@lome-chat/db/factories';
import { personas, DEV_PASSWORD } from '@lome-chat/shared';

export const SEED_CONFIG = {
  USER_COUNT: 5,
  PROJECTS_PER_USER: 2,
  CONVERSATIONS_PER_USER: 2,
  MESSAGES_PER_CONVERSATION: 5,
} as const;

// Generate deterministic UUIDs for seeding (based on namespace)
// Format: 00000000-0000-4000-8000-{12 hex digits from name}
export function seedUUID(name: string): string {
  // Create a simple hash of the name and format as UUID
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(12, '0').slice(0, 12);
  return `00000000-0000-4000-8000-${hex}`;
}

type User = typeof users.$inferInsert;
type Conversation = typeof conversations.$inferInsert;
type Message = typeof messages.$inferInsert;
type Project = typeof projects.$inferInsert;
type Account = typeof accounts.$inferInsert;

interface SeedData {
  users: User[];
  projects: Project[];
  conversations: Conversation[];
  messages: Message[];
}

interface PersonaData {
  users: User[];
  accounts: Account[];
  projects: Project[];
  conversations: Conversation[];
  messages: Message[];
}

export function generateSeedData(): SeedData {
  const seedUsers: User[] = [];
  const seedProjects: Project[] = [];
  const seedConversations: Conversation[] = [];
  const seedMessages: Message[] = [];

  // Generate users - let faker generate realistic names and emails
  for (let i = 0; i < SEED_CONFIG.USER_COUNT; i++) {
    const userId = seedUUID(`seed-user-${String(i + 1)}`);
    seedUsers.push(
      userFactory.build({
        id: userId,
      })
    );

    // Generate projects for this user - let faker generate realistic names
    for (let j = 0; j < SEED_CONFIG.PROJECTS_PER_USER; j++) {
      seedProjects.push(
        projectFactory.build({
          id: seedUUID(`seed-project-${String(i + 1)}-${String(j + 1)}`),
          userId,
        })
      );
    }

    // Generate conversations for this user - let faker generate realistic titles
    for (let j = 0; j < SEED_CONFIG.CONVERSATIONS_PER_USER; j++) {
      const convId = seedUUID(`seed-conv-${String(i + 1)}-${String(j + 1)}`);
      seedConversations.push(
        conversationFactory.build({
          id: convId,
          userId,
        })
      );

      // Generate messages for this conversation - let faker generate realistic content
      for (let k = 0; k < SEED_CONFIG.MESSAGES_PER_CONVERSATION; k++) {
        const role = k % 2 === 0 ? 'user' : 'assistant';
        seedMessages.push(
          messageFactory.build({
            id: seedUUID(`seed-msg-${String(i + 1)}-${String(j + 1)}-${String(k + 1)}`),
            conversationId: convId,
            role,
            model: role === 'assistant' ? 'gpt-4' : null,
          })
        );
      }
    }
  }

  return {
    users: seedUsers,
    projects: seedProjects,
    conversations: seedConversations,
    messages: seedMessages,
  };
}

/**
 * Generates persona data for development users (alice, bob, charlie).
 * These users have fixed UUIDs and known passwords for easy login during development.
 */
export async function generatePersonaData(): Promise<PersonaData> {
  const personaUsers: User[] = [];
  const personaAccounts: Account[] = [];
  const personaProjects: Project[] = [];
  const personaConversations: Conversation[] = [];
  const personaMessages: Message[] = [];

  // Hash the dev password once (same for all personas)
  const hashedPassword = await hashPassword(DEV_PASSWORD);
  const now = new Date();

  // Create users and accounts for each persona
  for (const [name, persona] of Object.entries(personas)) {
    personaUsers.push({
      id: persona.id,
      email: persona.email,
      name: persona.name,
      emailVerified: persona.emailVerified,
      image: null,
      createdAt: now,
      updatedAt: now,
    });

    personaAccounts.push({
      id: seedUUID(`account-${name}`),
      userId: persona.id,
      accountId: persona.email,
      providerId: 'credential',
      password: hashedPassword,
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      idToken: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Generate sample data only for Alice
  const aliceId = personas.alice.id;

  // 2 projects for Alice
  for (let i = 0; i < 2; i++) {
    personaProjects.push(
      projectFactory.build({
        id: seedUUID(`alice-project-${String(i + 1)}`),
        userId: aliceId,
      })
    );
  }

  // 3 conversations for Alice (2 in first project, 1 without project)
  for (let i = 0; i < 3; i++) {
    const convId = seedUUID(`alice-conv-${String(i + 1)}`);
    personaConversations.push(
      conversationFactory.build({
        id: convId,
        userId: aliceId,
      })
    );

    // 3-5 messages per conversation
    const messageCount = 3 + (i % 3); // 3, 4, 5 messages
    for (let j = 0; j < messageCount; j++) {
      const role = j % 2 === 0 ? 'user' : 'assistant';
      personaMessages.push(
        messageFactory.build({
          id: seedUUID(`alice-msg-${String(i + 1)}-${String(j + 1)}`),
          conversationId: convId,
          role,
          model: role === 'assistant' ? 'gpt-4' : null,
        })
      );
    }
  }

  return {
    users: personaUsers,
    accounts: personaAccounts,
    projects: personaProjects,
    conversations: personaConversations,
    messages: personaMessages,
  };
}

type DbClient = ReturnType<typeof createDb>;
type Table =
  | typeof users
  | typeof conversations
  | typeof messages
  | typeof projects
  | typeof accounts;

export async function upsertEntity(
  db: DbClient,
  table: Table,
  data: { id: string }
): Promise<'created' | 'exists'> {
  const existing = await db.select().from(table).where(eq(table.id, data.id)).limit(1);

  if (existing.length === 0) {
    await db.insert(table).values(data);
    return 'created';
  }
  return 'exists';
}

export async function seed(): Promise<void> {
  // Check if DATABASE_URL is already set (e.g., in tests or CI)
  // If not, load from .env.development
  if (!process.env.DATABASE_URL) {
    const envPath = resolve(process.cwd(), '.env.development');
    config({ path: envPath });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const db = createDb({
    connectionString: databaseUrl,
    neonDev: LOCAL_NEON_DEV_CONFIG,
  });

  // Generate both regular seed data and persona data
  const data = generateSeedData();
  const personaData = await generatePersonaData();

  console.log('Seeding database...');
  console.log('');
  console.log('Dev Personas:');
  console.log(`  Users: ${String(personaData.users.length)}`);
  console.log(`  Accounts: ${String(personaData.accounts.length)}`);
  console.log(`  Projects: ${String(personaData.projects.length)}`);
  console.log(`  Conversations: ${String(personaData.conversations.length)}`);
  console.log(`  Messages: ${String(personaData.messages.length)}`);
  console.log('');
  console.log('Random Seed Data:');
  console.log(`  Users: ${String(data.users.length)}`);
  console.log(`  Projects: ${String(data.projects.length)}`);
  console.log(`  Conversations: ${String(data.conversations.length)}`);
  console.log(`  Messages: ${String(data.messages.length)}`);
  console.log('');

  // Seed persona users first (they have accounts)
  let created = 0;
  let exists = 0;
  for (const user of personaData.users) {
    const result = await upsertEntity(db, users, user);
    if (result === 'created') created++;
    else exists++;
  }
  console.log(`Persona Users: ${String(created)} created, ${String(exists)} already existed`);

  // Seed persona accounts
  created = 0;
  exists = 0;
  for (const account of personaData.accounts) {
    const result = await upsertEntity(db, accounts, account);
    if (result === 'created') created++;
    else exists++;
  }
  console.log(`Persona Accounts: ${String(created)} created, ${String(exists)} already existed`);

  // Seed regular users
  created = 0;
  exists = 0;
  for (const user of data.users) {
    const result = await upsertEntity(db, users, user);
    if (result === 'created') created++;
    else exists++;
  }
  console.log(`Random Users: ${String(created)} created, ${String(exists)} already existed`);

  // Seed all projects (persona + random)
  created = 0;
  exists = 0;
  for (const project of [...personaData.projects, ...data.projects]) {
    const result = await upsertEntity(db, projects, project);
    if (result === 'created') created++;
    else exists++;
  }
  console.log(`Projects: ${String(created)} created, ${String(exists)} already existed`);

  // Seed all conversations (persona + random)
  created = 0;
  exists = 0;
  for (const conv of [...personaData.conversations, ...data.conversations]) {
    const result = await upsertEntity(db, conversations, conv);
    if (result === 'created') created++;
    else exists++;
  }
  console.log(`Conversations: ${String(created)} created, ${String(exists)} already existed`);

  // Seed all messages (persona + random)
  created = 0;
  exists = 0;
  for (const msg of [...personaData.messages, ...data.messages]) {
    const result = await upsertEntity(db, messages, msg);
    if (result === 'created') created++;
    else exists++;
  }
  console.log(`Messages: ${String(created)} created, ${String(exists)} already existed`);

  console.log('\nSeed complete!');
}

// Only run if this is the entry point
const isMain = import.meta.url === `file://${String(process.argv[1])}`;
if (isMain) {
  seed().catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
}
