import app from './app';
import { config } from './config';
import { logger } from './logger';

const port = config.server.port || 3001;

app.listen(port, () => {
  logger.info(`🚀 Backend server listening on http://localhost:${port}`);
});
