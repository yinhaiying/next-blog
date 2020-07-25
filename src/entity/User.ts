import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from "typeorm";
import { Post } from './Post'
import { Comment } from './Comment'
import { getDatabaseConnection } from './../../lib/getDatabaseConnection';
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
    if (this.username.trim().length === 0) {
      this.errors.username.push('用户名不能为空');
    } else if (!/[_a-zA-Z0-9]/g.test(this.username.trim())) {
      this.errors.username.push('用户名格式不合法');
    } else if (this.username.trim().length < 5 || this.username.trim().length > 30) {
      this.errors.username.push('用户名长度为5-30之间');
    } else if ((await getDatabaseConnection()).manager.find(
      User, { username: this.username })
    ) {
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
    return !!Object.values(this.errors).find(value => value.length > 0);
  }
}
