export const serializeDate = <
  T extends { createdAt: Date; updatedAt?: Date | null },
>(
  obj: T,
) => ({
  ...obj,
  createdAt: obj.createdAt.toISOString(),
  updatedAt: obj.updatedAt ? obj.updatedAt.toISOString() : null,
});
