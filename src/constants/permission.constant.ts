export enum Permission {
  HOME = 'read:home',
  CREATE_USER = 'create:user',
  WRITE_USER = 'write:user',
  WRITE_ROLE = 'write:role',
  READ_ROLE = 'read:role',
  WRITE_CATEGORY = 'write:category',
  DELETE_CATEGORY = 'delete:category',
}

export enum PermissionGroup {
  USER = 'user',
  ROLE = 'role',
  CATEGORY = 'category',
}
