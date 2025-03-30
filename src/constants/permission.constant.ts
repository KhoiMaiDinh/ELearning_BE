export enum Permission {
  HOME = 'read:home',
  CREATE_USER = 'create:user',
  WRITE_USER = 'write:user',
  WRITE_ROLE = 'write:role',
  READ_ROLE = 'read:role',
  WRITE_CATEGORY = 'write:category',
  DELETE_CATEGORY = 'delete:category',
  WRITE_COURSE = 'write:course',
  WRITE_SECTION = 'write:section',
  WRITE_COURSE_ITEM = 'write:course_item',
  READ_COURSE_ITEM = 'read:course_item',
}

export enum PermissionGroup {
  USER = 'user',
  ROLE = 'role',
  CATEGORY = 'category',
  COURSE = 'course',
  SECTION = 'section',
  COURSE_ITEM = 'course_item',
}
