import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware } from './middleware/auth';
import { servicesMiddleware } from './middleware/services';
import { errorHandler } from './middleware/error';
import { webhookRoutes } from './routes/webhooks';
import { userRoutes } from './routes/users';
import { bookRoutes } from './routes/books';
import { bookshelfRoutes } from './routes/bookshelf';
import { sessionRoutes } from './routes/sessions';
import { streakRoutes } from './routes/streaks';
import { noteRoutes } from './routes/notes';
import { statsRoutes } from './routes/stats';

const app = new Hono();

// Global middleware
app.use('*', cors());
app.onError(errorHandler);

// Health check
app.get('/', (c) => c.json({ message: 'BookLoop API', version: '1.0.0' }));

// Webhooks (no auth required)
app.route('/webhooks', webhookRoutes);

// Authenticated routes
app.use('/users/*', authMiddleware, servicesMiddleware);
app.use('/books/*', authMiddleware, servicesMiddleware);
app.use('/bookshelf/*', authMiddleware, servicesMiddleware);
app.use('/sessions/*', authMiddleware, servicesMiddleware);
app.use('/streaks/*', authMiddleware, servicesMiddleware);
app.use('/notes/*', authMiddleware, servicesMiddleware);
app.use('/stats/*', authMiddleware, servicesMiddleware);

app.route('/users', userRoutes);
app.route('/books', bookRoutes);
app.route('/bookshelf', bookshelfRoutes);
app.route('/sessions', sessionRoutes);
app.route('/streaks', streakRoutes);
app.route('/notes', noteRoutes);
app.route('/stats', statsRoutes);

export default app;
