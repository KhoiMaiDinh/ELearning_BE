import util from 'util';
import { CacheKey } from '../constants/cache.constant';

export const createCacheKey = (key: CacheKey, ...args: string[]): string => {
  return util.format(key, ...args);
};
