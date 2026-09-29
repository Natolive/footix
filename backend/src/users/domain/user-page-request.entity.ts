import type { UserSort } from '@footix/shared';

export interface UserPageRequest {
  sort: UserSort;
  desc: boolean;
  offset: number;
  limit: number;
}
