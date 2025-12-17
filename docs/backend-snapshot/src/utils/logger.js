// Simple logger with level-aware output for staging/production
const levels = ['error', 'warn', 'info', 'debug'];

const envLevel = (process.env.LOG_LEVEL || '').toLowerCase();
const defaultLevel = (() => {
  if (envLevel && levels.includes(envLevel)) return envLevel;
  const env = (process.env.NODE_ENV || '').toLowerCase();
  if (env === 'production') return 'info';
  if (env === 'staging') return 'debug';
  return 'debug';
})();

function shouldLog(level) {
  return levels.indexOf(level) <= levels.indexOf(defaultLevel);
}

function prefix(level) {
  return `[${new Date().toISOString()}] ${level.toUpperCase()}:`;
}

export const logger = {
  level: defaultLevel,
  error: (...args) => {
    if (shouldLog('error')) console.error(prefix('error'), ...args);
  },
  warn: (...args) => {
    if (shouldLog('warn')) console.warn(prefix('warn'), ...args);
  },
  info: (...args) => {
    if (shouldLog('info')) console.info(prefix('info'), ...args);
  },
  debug: (...args) => {
    if (shouldLog('debug')) console.debug(prefix('debug'), ...args);
  },
};

export default logger;
