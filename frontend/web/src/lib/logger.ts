/**
 * Logger utility for application-wide consistent logging
 * Features:
 * - Log levels (debug, info, warn, error)
 * - Performance tracking
 * - Context/metadata support
 * - Browser console formatting
 */

// Log levels with numeric values for comparison
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// Current environment's log level
const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'production' 
  ? LogLevel.WARN 
  : LogLevel.DEBUG;

// Performance timer tracking
interface PerformanceTimer {
  start: number;
  metadata?: Record<string, any>;
}

// Performance timers storage
const timers: Record<string, PerformanceTimer> = {};

// Logger implementation
const logger = {
  /**
   * Log a debug message
   */
  debug: (message: string, metadata?: Record<string, any>): void => {
    if (CURRENT_LOG_LEVEL <= LogLevel.DEBUG) {
      console.debug(
        `%c[DEBUG] ${message}`, 
        'color: #6c757d', 
        metadata || ''
      );
    }
  },
  
  /**
   * Log an info message
   */
  info: (message: string, metadata?: Record<string, any>): void => {
    if (CURRENT_LOG_LEVEL <= LogLevel.INFO) {
      console.info(
        `%c[INFO] ${message}`, 
        'color: #0dcaf0', 
        metadata || ''
      );
    }
  },
  
  /**
   * Log a warning message
   */
  warn: (message: string, metadata?: Record<string, any>): void => {
    if (CURRENT_LOG_LEVEL <= LogLevel.WARN) {
      console.warn(
        `%c[WARN] ${message}`, 
        'color: #ffc107', 
        metadata || ''
      );
    }
  },
  
  /**
   * Log an error message
   */
  error: (message: string, metadata?: Record<string, any>): void => {
    if (CURRENT_LOG_LEVEL <= LogLevel.ERROR) {
      console.error(
        `%c[ERROR] ${message}`, 
        'color: #dc3545', 
        metadata || ''
      );
      
      // Additional error handling/reporting could go here
      // e.g., send to error monitoring service
    }
  },
  
  /**
   * Start tracking performance for an operation
   */
  trackStart: (operationName: string, metadata?: Record<string, any>): void => {
    timers[operationName] = {
      start: performance.now(),
      metadata
    };
  },
  
  /**
   * End tracking performance for an operation and log the time taken
   */
  trackEnd: (operationName: string, additionalMetadata?: Record<string, any>): void => {
    const timer = timers[operationName];
    if (!timer) {
      logger.warn(`No timer found for operation: ${operationName}`);
      return;
    }
    
    const duration = performance.now() - timer.start;
    delete timers[operationName];
    
    logger.info(
      `${operationName} completed in ${duration.toFixed(2)}ms`, 
      {
        ...timer.metadata,
        ...additionalMetadata,
        duration
      }
    );
  },
  
  /**
   * Group related logs together
   */
  group: (groupName: string, callback: () => void): void => {
    if (CURRENT_LOG_LEVEL <= LogLevel.DEBUG) {
      console.group(`%c[GROUP] ${groupName}`, 'color: #0d6efd');
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  },
  
  /**
   * Log an event (useful for analytics)
   */
  event: (eventName: string, metadata?: Record<string, any>): void => {
    if (CURRENT_LOG_LEVEL <= LogLevel.INFO) {
      console.info(
        `%c[EVENT] ${eventName}`, 
        'color: #20c997; font-weight: bold', 
        metadata || ''
      );
      
      // Additional analytics tracking could be added here
    }
  }
};

export default logger; 