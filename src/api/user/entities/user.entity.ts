import { InstructorEntity } from '@/api/instructor/entities/instructor.entity';
import { PostEntity } from '@/api/post/entities/post.entity';
import { PreferenceEntity } from '@/api/preference/entities/preference.entity';
import { RoleEntity } from '@/api/role/entities/role.entity';
import { SessionEntity } from '@/api/user/entities/session.entity';
import { Uuid } from '@/common';
import { RegisterMethod } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { AutoNanoId } from '@/decorators';
import { hashPassword as hashPass } from '@/utils';
import slugify from 'slugify';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from 'typeorm';

type RequiredUserProps = Pick<
  UserEntity,
  'email' | 'register_method' | 'last_name' | 'first_name'
>;
type OptionalUserProps = Partial<UserEntity>;

type UserProps = RequiredUserProps & OptionalUserProps;

@Unique(['email', 'register_method'])
@Entity('user')
export class UserEntity extends AbstractEntity {
  constructor(data?: UserProps) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_user_id' })
  user_id!: Uuid;

  @Index('EK_user_id', {
    unique: true,
  })
  @Column({
    type: 'varchar',
    nullable: false,
    length: 13,
  })
  @AutoNanoId(13)
  id: string;

  @Column({
    length: 50,
    nullable: true,
  })
  @Index('UQ_user_username', {
    where: '"deleted_at" IS NULL',
    unique: true,
  })
  username: string;

  @Column()
  @Index('UQ_user_email', { where: '"deleted_at" IS NULL', unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password!: string;

  @Column({ type: 'varchar', length: 60, nullable: false })
  first_name!: string;

  @Column({ type: 'varchar', length: 60, nullable: false })
  last_name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profile_image?: string;

  @Index('UQ_user_google', { where: '"deleted_at" IS NULL', unique: true })
  @Column({ type: 'varchar', nullable: true })
  google_id: string | null;

  @Index('UQ_user_facebook', { where: '"deleted_at" IS NULL', unique: true })
  @Column({ type: 'varchar', nullable: true })
  facebook_id: string | null;

  @Column({ type: 'enum', enum: RegisterMethod })
  register_method: RegisterMethod;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions?: Relation<SessionEntity[]>;

  @OneToMany(() => PostEntity, (post) => post.user)
  posts: Relation<PostEntity[]>;

  @ManyToMany(() => RoleEntity, (role) => role.users)
  @JoinTable()
  roles: Relation<RoleEntity[]>;

  @OneToOne(() => InstructorEntity, (instructor) => instructor.user)
  instructor_profile?: Relation<InstructorEntity>;

  @OneToOne(() => PreferenceEntity, (preference) => preference.user)
  preference?: Relation<PreferenceEntity>;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await hashPass(this.password);
    }
  }

  @BeforeInsert()
  async setUsername() {
    if (!this.username) {
      // Only generate if username is not manually set
      this.username = await UserEntity.generateUsername(
        this.first_name,
        this.last_name,
      );
    }
  }

  static async generateUsername(
    firstName: string,
    lastName: string,
  ): Promise<string> {
    const baseUsername = slugify(`${firstName} ${lastName}`, {
      replacement: '_',
      lower: true,
      remove: /[*+~.()'"!:@]/g,
    });

    // Check for existing usernames in the database (efficient query)
    const existingUsers = await this.createQueryBuilder('user')
      .where('user.username LIKE :username', { username: `${baseUsername}%` })
      .orderBy('LENGTH(user.username)', 'DESC')
      .addOrderBy('user.username', 'DESC')
      .getMany();

    if (existingUsers.length === 0) {
      return baseUsername;
    }

    return `${baseUsername}_${existingUsers.length + 1}`;
  }
}
