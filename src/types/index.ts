import type { SpaceRole } from "./space";

export type TypeOrNull<T> = T | null;

export type NonNullableObject<T extends object> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export type UnknownObject = {
  [x: string]: string | string[];
};

export type CursorPagination = {
  limit?: number;
  afterId?: string;
};

export type PaginationMeta = {
  hasMore: boolean;
  pageSize: number;
  nextCursor: string | null;
};

export interface ContextProps {
  email: string;
  username: string;
  userId: string;
  userSpaceRole: SpaceRole;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AwaitedReturnType<T extends (...args: any) => any> = Awaited<
  ReturnType<T>
>;
