import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column('varchar')
  title: string;
  @Column('text')
  content: string;
  // Partial表示不需要Post的所有数据
  constructor(attributes: Partial<Post>) {
    Object.assign(this, attributes)
  }
}
