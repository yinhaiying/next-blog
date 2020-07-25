import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from './User'
import { Comment } from './Comment'
import postsShow from '../../pages/posts/[id]';
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column('varchar')
  title: string;
  @Column('text')
  content: string;
  @Column('int')
  authorId: number;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @ManyToOne(type => User, user => user.posts)
  author: User;
  @OneToMany(type => Comment, comment => comment.post)
  comments: Comment[];
}
