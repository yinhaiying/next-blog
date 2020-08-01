# 使用 next.js 和 typeorm 搭建 blog


## 清空之前的开发环境
```
docker ps 查看容器
docker kill 容器id
// 清空数据
docker container prune
docker volume rm blog-data
```
## 使用 docker 启动数据库

```javascript
docker run -v "blog-data":/var/lib/postgresql/data -p 5432:5432 -e POSTGRES_USER=blog -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres:12.2
```

## 进入 docker 容器

- 进入 docker 容器和进入 pg 命令行

```javascript
docker exec -it 容器id bash
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

## 再次运行数据库
如果数据库中已经创建好migration和entity，这时候只需要运行如下代码即可。

```javascript
typeorm migration:run
node dist/seed.js
```

## react编写注册组件
1. useState
   useState不会自动合并所有数据，因此我们使用useState的时候需要将之前的数据复制过来。
```javascript
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordConfirmation: ''
  })
  <div>
    <label>用户名
      <input value={formData.username} onChange={e => setFormData({
      ...formData,
      username: e.target.value
    })} />
    </label>
  </div>

```
2. useCallBack
useCallback 的目的是在于缓存函数，这样方便配合上子组件的 shouldComponentUpdate 或者 React.memo 起到减少不必要的渲染的作用。
useCallback第二个参数如果为空，表示函数只执行一次。以后数据更新都不会重新执行。
所以如果你的函数不依赖与数据的变化，那么第二个参数可以为空,示例：
```javascript
const onSubmit = useCallback(() => {
   ...
},[])
  ```
但是如果你的函数依赖于数据的变化，可以将第二个参数设置成依赖的数据。
  ```javascript
const onSubmit = useCallback(() => {
   ...
},[formData])
  ```

## 扩展第三方npm包的接口参数
比如有个next包的nextAPI只有两个参数，但是我们想要添加一个参数，这时候就需要进行扩展：
```javascript
import * as Next from 'next';   // 必须引入。不然之前的所有接口属性都会被覆盖
import { NextApiRequest } from 'next';
import { Session } from 'next-iron-session';
declare module 'next' {
  interface NextApiRequest {
    session: Session
  }
}

```

## 如何在代码中隐藏密码和秘钥
1.创建.env.local文件，并写入秘钥
```javascript
SECRET=xxxxx
```
2. 通过process.env进行获取
```
process.env.SECRET读取秘钥
```
注意:.env.local文件不能上传到github上，否则还是会被看到。


## yarn migration:run 报错
如果我们不小心删除了数据库，需要重新运行yarn migration:run。这时候会出现报错：
提示getDatabaseConnection有问题。这是因为我们在项目中运行了连接数据库，而数据库
是不存在的，因此导致报错。可以先注释掉有getDatabaseConnection的代码。然后重新运行即可。


## entity实体的环形依赖问题
在Post实体中我们引用了User
```javascript
 @ManyToOne(type => User, user => user.posts)
```
在User实体中，我们引用了Post
```javascript
  @OneToMany(type => Post, post => post.author)
  posts: Post[];
```
这样互相引用会导致环形依赖问题。即使用Post的时候会User没有初始化。因为type => User需要引入User
解决办法是使用字符串替代：
```javascript
  @ManyToOne('User', 'posts')     // 环形依赖问题
```

## 部署到阿里云（非常重要）

### Docker化前的准备工作，确保代码正常运行，页面展示正常
```
yarn build 进行上线前的打包，确保没有错误
yarn start 查看打包后的网页，

```
每次有修改时需要重新build

### Docker话你的应用
[参考文档](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

1. 使用`touch Dockerfile`命令创建一个空的docker文件（进入文件目录）
注意在windows上最好使用bash工具进行创建，否则可能无法识别touch命令
```javascript
touch Dockerfile
```
2. 打开Dockerfile文件，编写一下代码，设置你想要使用的node版本
```javascript
FROM node:12
```

3. 设置你代码存放的位置
```javascript

# Create app directory
WORKDIR /usr/src/app

```
4. 把我们的文件拷贝到linux上的工作目录了。根据你的包管理器，设置package.json和package.lock.json。如果你是使用yarn,需要拷贝yarn.lock。
```javascript
COPY package.json ./
COPY yarn.lock ./

```
5. 在Linux上安装生产环境需要的包
```javascript
// Run npm install  使用npm包管理器
Run yarn intall    // 使用yarn包管理器
```

6. 把我们的源码拷贝到Linux的对应的位置。其中COPY表示从本地拷贝到云服务器。

```javascript
COPY . .
```
7. 设置端口：
```javascript
EXPOSE 3000
```
8. 定义生产环境启动运行的命令.这里我们运行的命令是yarn start
```javascript
CMD [ "yarn", "start" ]
```

9. 创建.dockerignore文件忽略将node_modules等文件拷贝到docker中。然后在.dockerignore中写入如下代码：
```javascript
node_modules
*.log
```

10. 在命令行中输入以下命令构建属于自己的docker镜像
```javascript
// docker build -t <your username>/node-web-app .
docker build -t haiying/node-web-app .
```

11. 运行刚刚创建的镜像
```javacript
docker run -p 3000:3000 -d haiying/node-web-app
```

12 .测试是否能够正常访问
```javascript
docker ps -a // 查看端口是否运行正常

```
在浏览器中输入http://192.168.99.100:3000/或者localhost:3000看看能否正常展示（我们上一步运行docker其中有一步就是yarn start，因此如果一切正常的话页面是能够正常访问的）ps:如果是使用旧版的docker这里的host是docker对应的host。如果碰到问题，可以使用docker logs查看错误。


## 阿里云的设置（非常重要）

### 购买

###  登录
1. 每次都使用密码登录
```javascript
ssh root@xxx.xxx.xxx.xxx

```
2. 上传SSH key到服务器
通过将SSH key上传到服务器这样的话我们就不需要每次登陆都输入密码了。
```javascript
ssh-copy-id root@xxx.xxx.xxx.xxx
```

### 为应用单独创建user而不是使用root
1. 创建blog用户
```javascript
adduser blog   // 创建一个blog用户
```
2. 切换blog用户
```javascript
su - blog   // blog@haiying:~$   我们可以通过 pwd查看blog所在的目录
```

### 直接登录到blog用户
```javascript
ssh blog@xx.xx.xxx.xx
```
同样为了避免输入密码，我们把ssh key上传到blog用户对应的目录中
```javascript
ssh-copy-id blog@xxx.xxx.xxx.xxx
```
