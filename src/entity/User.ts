import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, BeforeInsert } from "typeorm";
import { Post } from './Post'
import { Comment } from './Comment'
import { getDatabaseConnection } from '../../lib/getDatabaseConnection';
import md5 from 'md5'
import _ from 'lodash'
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column('varchar')
  username: string;
  @Column('varchar')
  passwordDigest: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @OneToMany(type => Post, post => post.author)
  posts: Post[];
  @OneToMany(type => Comment, comment => comment.user)
  comments: Comment[];
  // 没有加装饰器表示不是字段不是数据库的，但是是类的
  errors = {
    username: [] as string[],
    password: [] as string[],
    passwordConfirmation: [] as string[]
  };
  password: string;
  passwordConfirmation: string;
  async validate() {
    // found返回的是一个promise
    const found = await (await getDatabaseConnection()).manager.find(
      User, { username: this.username });
    if (this.username.trim().length === 0) {
      this.errors.username.push('用户名不能为空');
    } else if (!/[_a-zA-Z0-9]/g.test(this.username.trim())) {
      this.errors.username.push('用户名格式不合法');
    } else if (this.username.trim().length < 5 || this.username.trim().length > 30) {
      this.errors.username.push('用户名长度为5-30之间');
    } else if (found.length > 0) {
      this.errors.username.push('用户名已存在');
    }
    // 校验password
    if (this.password === '') {
      this.errors.password.push('密码不能为空')
    } else if (this.password.length < 6) {
      this.errors.password.push('密码长度不能小于6位')
    }
    if (this.password !== this.passwordConfirmation) {
      this.errors.passwordConfirmation.push('密码不匹配')
    }
  };
  hasErrors() {
    console.log('errors:', this.errors)
    return !!Object.values(this.errors).find(value => value.length > 0);
  };
  // 在save之前插入
  @BeforeInsert()
  generatePasswordDigest() {
    this.passwordDigest = md5(this.password);
  }
  @BeforeInsert()
  setCreatedTime() {
    this.createdAt = new Date();
    this.createdAt = new Date();
  }
  toJSON() {
    return _.omit(this, ['password', 'passwordDigest', 'passwordConfirmation', 'updatedAt', 'errors'])
  }
}
