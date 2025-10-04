import { inject } from '@vercel/analytics';

export default () => {
  // Only run in production and on client side
  if (process.env.NODE_ENV === 'production' && process.client) {
    inject();
  }
};

