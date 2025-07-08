import { env } from '../config/environment';
//Domains allow to access to server
export const WHITELIST_DOMAINS = ['https://trello-web-pink-alpha.vercel.app'];

export const BOARD_TYPES = { PUBLIC: 'public', PRIVATE: 'private' };

export const WEBSITE_DOMAIN =
  env.BUILD_MODE === 'production'
    ? env.WEBSITE_DOMAIN_PRODUCTION
    : env.WEBSITE_DOMAIN_DEVELOPMENT;

export const DEFAULT_PAGE = 1;
export const DEFAULT_ITEM_PER_PAGE = 12;
