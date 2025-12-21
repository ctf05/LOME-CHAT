import { Hono } from 'hono';
import { cors, errorHandler } from './middleware/index.js';
import { healthRoute, authRoute, conversationsRoute, chatRoute } from './routes/index.js';

export function createApp(): Hono {
  const app = new Hono();

  app.use('*', cors());
  app.onError(errorHandler);

  app.route('/health', healthRoute);
  app.route('/auth', authRoute);
  app.route('/conversations', conversationsRoute);
  app.route('/chat', chatRoute);

  return app;
}
