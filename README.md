# 使用 next.js 和 typeorm 搭建 blog

## 使用 docker 启动数据库

```javascript
docker run -v "blog-data":/var/lib/postgresql/data -p 5432:5432 -e POSTGRES_USER=blog -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres:12.2
```

## 如何关闭之前的容器
```
docker ps 查看容器
docker kill 容器id
dockr rm 容器id
```

## 验证 pg

- 进入 docker 容器

```javascript
docker exec -it 容器id bash
```

- 进入 pg 命令行

```javascript
psql -U blog -W
```

- 执行 pg 命令行

```javascript
\l 用于list databases
\c 用于connect to a database   // \c blog_development 连接到blog_development数据库
\dt 用于display tables
```

## 创建数据库

```javascript
CREATE DATABASE blog_development ENCODING 'UTF8' LC_COLLATE 'en_US.utf8' LC_CTYPE 'en_US.utf8';
CREATE DATABASE blog_test ENCODING 'UTF8' LC_COLLATE 'en_US.utf8' LC_CTYPE 'en_US.utf8';
CREATE DATABASE blog_production ENCODING 'UTF8' LC_COLLATE 'en_US.utf8' LC_CTYPE 'en_US.utf8';
```

## 删除数据库
```javascript
drop database +数据库名
```

## [安装 typeorm](https://github.com/typeorm/typeorm)

```javascript
 yarn add typeorm reflect-metadata  @types/node pg -S   // typeorm最好全局安装
```

修改 tsconfig 的配置文件

```javascript
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

## 使用 typeorm

```javascript
npx typeorm init --database postgres
```

将 gitignore 的所有修改撤销

```javascript
git checkout HEAD -- .gitignore
```

将 package.json 的所有修改撤销

```javascript
git checkout HEAD -- package.json
```

将 tsconfig.json 的所有修改撤销

```javascript
 git checkout HEAD -- tsconfig.json
```

修改 ormconfi.json 中的 ip 地址为 docker 的 ip 地址,username 等

```javascript
{
  "type": "postgres",
  "host": "192.168.99.100",
  "port": 5432,
  "username": "blog",
  "password": "",
  "database": "blog_development",
}
```

## 使用 next 内置的 babel 运行 src/index.js

1. 将 src/下的 ts,tsx 编译成 js 代码

```javascript
npx babel ./src --out-dir dist --extensions ".ts,.tsx"
```

2. 解决报错
   配置 babelrc 文件，解决报错信息

```javascript
{
  "presets": ["next/babel"],
  "plugins": [
    [
      "@babel/plugin-proposal-decorators",
      {
        "legacy": true
      }
    ]
  ]
}

```

3. 修改 ormconfig.json 中的 entities
   只有将这里修改成.js 文件，才能使用 node 进行执行。否则始终执行的是 src/ts 文件。

```javascript
  "entities": [
    "dist/entity/**/*.js"
  ],
```

4. 使用 node.js 运行 dist/index.js
   每次运行前，需要使用 npx 进行 babel 转换一下

```javascript
npx babel ./src --out-dir dist --extensions ".ts,.tsx"
node dist/index.js
```

## typeorm 进行表的创建

```javascript
npx typeorm migration:create -n CreateXX

// 示例 如果我们想要创建一个Users表
npx typeorm migration:create -n CreateUsers

```
## 编写migration，定义表中数据类型
```javascript
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsers1595374863122 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'int', isGenerated: true, generationStrategy: 'increment', isPrimary: true },
        { name: 'username', type: 'varchar' },
        { name: 'password_digest', type: 'varchar' }
      ]
    }
    ))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable('users')
  }

}
```
然后运行：
```javascript
npx typeorm migration:run
```


## 合并 package.json 中 script 的多个命令

```javascript
yarn add concurrently -D   // 安装
"dev": "concurrently \"next dev\"  \"babel -w ./src --out-dir dist --extensions .ts,.tsx\"",   // 使用
```

使用时，只需要在前面添加 concurrently，然后命令需要使用双引号包裹，同时命令之间用空格隔开。

## 创建实例来操作数据

```javascript
typeorm entity:create -n + 要操作表的类
// 示例
typeorm entity:create -n Post    // 表示用Post类来操作posts表
```

将其添加到命令行

```javascript
"entity:create": "typeorm entity:create"
```

将数据映射到实体(Entity,即一个实际的类)

```javascript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column("varchar")
  title: string;
  @Column("text")
  content: string;
}
```

## 使用 manager 操作实体

实体类和对象分别对应于数据表和数据行

```javascript
const posts = await connection.manager.find(Post);
console.log(posts);
const p = new Post();
p.title = "第一篇博客";
p.content = "我的第一篇博客";
await connection.manager.save(p);
const post2 = await connection.manager.find(Post);
console.log(post2);
connection.close();
```

## 使用seed填充数据
```javascript
createConnection().then(async connection => {
  const posts = await connection.manager.find(Post);
  console.log('posts:', posts)
  if (posts.length === 0) {
    // seed脚本创建数据
    await connection.manager.save([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
      return new Post({ title: `Post${n}`, content: `我的第 ${n}篇文章` })
    }));
  }
  connection.close();
}).catch(error => console.log(error));

```
这里需要注意的是，我们在创建数据时，修改了post实体：
```javascript
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
```

## 增删改查的实现

## 创建数据表
```javascript
npx typeorm migration:create -n CreateUsers
npx typeorm migration:create -n CreatePosts
npx typeorm migration:create -n CreateComments
```
## 编写migration，定义表中数据类型
```javascript
import { MigrationInterface, QueryRunner, Table } from "typeorm";
export class CreateUsers1595374863122 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'int', isGenerated: true, generationStrategy: 'increment', isPrimary: true },
        { name: 'username', type: 'varchar' },
        { name: 'password_digest', type: 'varchar' }
      ]
    }
    ))
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable('users')
  }
}
```
然后运行,实现表的创建：
```javascript
npx typeorm migration:run
```

## 给数据表新增创建时间和修改时间字段
```javascript
npx typeorm migration:create -n AddCreatedAtAndUpdatedAt

```
## 增加字段
```javascript

import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCreatedAtAndUpdatedAt1595376508841 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.addColumns('users', [
      new TableColumn(
        { name: 'createdAt', type: "datetime", isNullable: false, default: 'now()' }
      ),
      new TableColumn(
        { name: 'updatedAt', type: "datetime", isNullable: false, default: 'now()' }
      ),
    ])
    queryRunner.addColumns('posts', [
      new TableColumn(
        { name: 'createdAt', type: "datetime", isNullable: false, default: 'now()' }
      ),
      new TableColumn(
        { name: 'updatedAt', type: "datetime", isNullable: false, default: 'now()' }
      ),
    ])
    queryRunner.addColumns('comments', [
      new TableColumn(
        { name: 'createdAt', type: "datetime", isNullable: false, default: 'now()' }
      ),
      new TableColumn(
        { name: 'updatedAt', type: "datetime", isNullable: false, default: 'now()' }
      ),
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropColumn('users', 'createdAt');
    queryRunner.dropColumn('users', 'updatedAt');
    queryRunner.dropColumn('posts', 'createdAt');
    queryRunner.dropColumn('posts', 'updatedAt');
    queryRunner.dropColumn('comments', 'createdAt');
    queryRunner.dropColumn('comments', 'updatedAt');
  }
}

```
然后运行,
```javascript
npx typeorm migration:run
```

## 查看表结构
```javascript
\d comments;  // 查看comments表的数据结构
```


## 创建实体
```javascript
npx typeorm entity:create -n User
npx typeorm entity:create -n Post
npx typeorm entity:create -n Comment
```

## 使用seed填充数据
```javascript
createConnection().then(async connection => {
  const { manager } = connection;
  // 创建user1
  const u1 = new User();
  u1.username = 'mary';
  u1.passwordDigest = '12345';
  await manager.save(u1);
  console.log(u1.id)
  // 创建post1
  const p1 = new Post();
  p1.title = "first blog";
  p1.content = "我的第一篇博客";
  p1.author = u1;
  await manager.save(p1);
  // 创建comment1
  const c1 = new Comment();
  c1.content = "第一条评论";
  c1.user = u1;
  c1.post = p1;
  await manager.save(c1);
  connection.close();
}).catch(error => console.log(error));
```
