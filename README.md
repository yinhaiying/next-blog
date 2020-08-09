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


### 安装docker
到目前为止我们创建了blog用户，但是当前用户什么都没有，没有node,没有yarn,没有各种包。
因此我们需要先安装docker。通常是直接安装在root目录下，然后让blog用户去使用即可。
[安装教程](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04#:~:text=%20How%20To%20Install%20and%20Use%20Docker%20on,of%20passing%20it%20a%20chain%20of...%20More%20)


### 查看docker是否安装成功
```javascript
which docker:可以查看是否能够使用docker，
docker run hello-world:查看docker能否运行成功。
```

### 将blog添加到docker分组中
由于blog用户权限太低了，他无权限使用root中的docker，因此，我们需要将blog用户添加到docker组中。
```javascript
usermod -a -G docker blog
```

### 使用git clone 下载代码
一些常用的文件命令
```javascript
pwd 查看当前目录
ls -l 查看当前目录文件列表
ls -a
ls -la 查看带权限信息的文件列表

```
我们现在的blog用户中是没有项目的，我们需要从git中把项目下载下来。
1. 查看是否有git命令
```javascript
git
git --version
```

2. git clone 下载代码

```javascript
mkdir app
cd app
git clone +仓库地址
```
这时候可能会给你如下报错提示：
```javascript
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.
Please make sure you have the correct access rights
```
这个提示是因为我们linux服务器上没有设置SSH，无法从远程拉取代码。
在服务器端生成SSH。这里千万要记住生成key时的密码。再拉取代码时需要再次输入。
(默认密码:A)
```javascript
ssh-keygen -t RSA -C "18840842571@163.com"
```
然后把这个SSH添加到我们的github中的SSH设置中（不需要关心github已经有几个SSH了）。
```javascript
cat ~/.ssh/id_rsa.pub
```
### 如何不设置密码
这里如果需要设置密码，那样的话每次拉取的时候就都需要设置密码，也可以不设置密码，直接enter下一步。
如果设置了密码想要修改，使用下面的语句。
```javasceipt
ssh-keygen -p
```


然后重新再次运行git clone
```javascript
git clone +仓库地址
```
这样的话，以后只要远程仓库有修改，就可以通过git pull进行拉取最新的代码。


### 在阿里云去构建应用
我们目前已经有了代码了，但是我们还需要在服务器上能够把代码跑起来。这需要数据库，运行docker等。

### 在linux服务器上为docker配置镜像
为了确保在阿里云上使用docker镜像下载速度，我们需要在服务器上配置好docker镜像。
[配置方法](https://blog.csdn.net/fenglibing/article/details/92090925)

1. 创建数据库的保存地址,我们将数据库不放在app里面，而是单独拿出来
```javascript
blog@haiying:~$  mdkir blog-data
```
2. 使用docker启动数据库
```javascript
// 老的运行方式
// docker run -v "blog-data":/var/lib/postgresql/data -p 5432:5432 -e POSTGRES_USER=blog -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres:12.2

// 新的方式需要将数据库地址写成绝对路径  就是我们刚刚创建数据库的地方
docker run -v /home/blog/blog-data/:/var/lib/postgresql/data -p 5432:5432 -e POSTGRES_USER=blog -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres:12.2
```
然后运行docker ps查看端口是否运行。
3. 然后用docker运行应用即可。注意需要切换到当前项目目录下
```javascript
cd app/next/blog
docker build -t haiying/node-web-app .
docker run -p 3000:3000 -d haiying/node-web-app
```

4 查看是否运行成功，这里可能会失败：
```javascript
docker ps       // 查看运行成功的端口
docker ps -a    // 查看所有端口，包括运行失败的端口
docker logs + 端口号   // 查看端口运行失败的日志

```
我们查看报错原因：
```javascript
 Could not find a valid build in the '/usr/src/app/.next' directory! Try building your app with 'next build' before starting the server.
```
这表明我们没有进行yarn build，导致服务器上的.next中没有build文件，因此，我们需要提前build好文件，然后再上传到github。再使用docker。因此，我们需要先在root安装yarn和node。
5. 安装yarn 和 node
```javascript
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install gcc g++ make
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
     sudo apt-get update && sudo apt-get install yarn
```

然后查看是否安装成功:
```javascript
which node
which yarn

```
查看blog用户是否有权限使用node和yarn
```javascript
su - blog
which  node
which yarn
```
然后安装依赖和进行build
```javascript
cd next/blog
yarn install
yarn build
```
7. 在服务器上修改.env.local文件。
这时候build时会发现报错，这是因为我们github上是没有.env.local文件的，导致获取不到SECRET,但是我们又不能
将.env.local上传到github，因此我们需要手动在服务器上创建.env.local文件并写入内容。然后再重新build。
然后再重新创建docker应用，并且运行docker应用。
```javascript
docker build -t haiying/node-web-app .
docker run -p 3000:3000 -d haiying/node-web-app
```
到目前为止，我们才实现在阿里云服务器上使用docker运行我们的node应用。
但是，当我们运行curl -L http://localhost:3000时我们会发现，一直处于等待状态。
这是因为我们的ormconfig.json文件中配置的host是我们本地的docker的host。
```javascript
  "host": "192.168.xx.xxx",
```
这会导致阿里云一直去连接这个host，从而失败。因此我们需要根据在所有使用到Host的地方根据环境来判断Host的设置。
8. 根据环境设置Host
修改getDatabaseConnection.tsx文件。
```javascript
const create = () => {
  // @ts-ignore
  return createConnection({
    ...config,
    host: process.env.NODE_ENV === 'production' ? 'localhost' : config.host,
    'entities': [Post, User, Comment]
  })
}

```
9. 重新开始
由于涉及到代码的更新，我们需要重新从github拉取远程代码到阿里云。因此，整个过程都需要重新开始。
```javascript
git pull
yarn install
yarn build
docker ps
docker kill + 端口号
docker rm + 端口号
docker build -t haiying/node-web-app .
docker run -p 3000:3000 -d haiying/node-web-app
curl -L http://localhost:3000
```
如果出现报错：可以通过docker logs + 端口号

10. 可以查看页面了，但是遇到新的问题：
```javascript
Error: connect ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1141:16) {
  errno: 'ECONNREFUSED',
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '127.0.0.1',
  port: 5432
}
```
我们需要修改连接数据库的host。
11. 给docker run 添加 --network=host选项
先删除所有运行的docker
```javascript
docker kill xxx
docker rm xxx
docker run --network=host -v /home/blog/blog-data/:/var/lib/postgresql/data -p 5432:5432 -e POSTGRES_USER=blog -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres:12.2
docker run --network=host -p 3000:3000 -d haiying/node-web-app
curl -L http://localhost:3000
```
这样的话我们就实现了在阿里云上连接数据库。

12. 创建数据库
在我们运行curl时，我们还是发现了如下报错，说明阿里云上没有数据库，因此我们需要在阿里云上创建数据库。
```javascript
error: database "blog_development" does not exist
```

创建的方法和在windows上一致。
```javascript

docker exec -it psgl容器id bash
psql -U blog -W

CREATE DATABASE blog_development ENCODING 'UTF8' LC_COLLATE 'en_US.utf8' LC_CTYPE 'en_US.utf8';
CREATE DATABASE blog_test ENCODING 'UTF8' LC_COLLATE 'en_US.utf8' LC_CTYPE 'en_US.utf8';
CREATE DATABASE blog_production ENCODING 'UTF8' LC_COLLATE 'en_US.utf8' LC_CTYPE 'en_US.utf8';

```

13. 创建数据表
按照在本地的方法，我们需要先运行yarn dev将ts转换成js，然后运行yarn migration:run。
```javascript
yarn dev
yarn migration:run
```
但是我们会发现命令一直处于等待中，连接不上数据库，因为yarn migration默认会去读取本地的ormconfig.json文件，但是这个文件实际上只是用于本地的开发，我们写的各种数据库，端口等都是本地的设置，而不是生产环境的设置。
而且这是个.json文件，无法进行环境区分。因此，我们需要修改线上的orm.config.json的配置
然后修改host和database
```javascript
  "host": "localhost",
  "database": "blog_production",
```
这里在运行时会报错，由于typeorm如果没有数据库，无法连接。
因此需要注释与`getDatabaseConnection`相关的代码：
```javascript
import { getDatabaseConnection } from '../../lib/getDatabaseConnection';
```
同时我们需要设置阿里云上的NDOE_ENV为production
```javascript
vim ~/.bashrc
export NODE_ENV=production  // 在第一行添加
```
然后重新build
```javascript

yarn dev
yarn migration:run
```
这时候我们build会发现报错：这是因为我们设置环境为production之后，会导致不安装开发环境的包。
但是我们需要把这些装好之后从弄到docker中，因此需要进行一次设置。
```javascript
yarn install --production=false
```
14. 将3000端口加入安全策略
这样的话，我们就可以通过xxx.xxx.xx.xx/3000端口在浏览器中进行访问了。

## 部署总结：
全部步骤：
```javascript
git pull    // 拉代码时需要输入密码：区分大小写
yarn install --production=false
yarn build
docker ps
docker kill xxx
docker rm xxx
docker run --network=host -v /home/blog/blog-data/:/var/lib/postgresql/data -p 5432:5432 -e POSTGRES_USER=blog -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres:12.2
docker build -t haiying/node-web-app .
docker run --network=host -p 3000:3000 -d haiying/node-web-app
curl -L http://localhost:3000
docker logs xx
```

## 重新部署
如果docker被关闭了，那么千万不要删除docker，而是重启docker即可。docker一旦被删除，那么所有的内容就会被删除。尤其是数据库。当我们将阿里云服务器关闭之后，docker容器就会被关闭，再次使用时需要先开启docker容器。
```javascript
1. 开启服务器
2. 开启psql容器 docker ps -a 查看最近运行的容器 docker restart xxx
3. 更新代码 gitp pull yarn install --production=false yarn build
4. 构建app容器 docker build -t haiying/node-web-app .（每次有修改后都需要重新构建build然后构建app容器，如果没有修改可以直接restart）
5. 开启app容器 docker run --network=host -p 3000:3000 -d haiying/node-web-app
6. 自动化部署脚本
```

## 自动化部署
所谓的自动化部署实际上就是把代码在远程服务器上进行执行。
1. 首先在本地的git bash中运行如下代码，确保有执行权限。
```javascript
chomd +x bin/deploy.sh
```
2. 本地执行
使用ssh进行登录，然后直接在后面加上你想要执行的shell命令即可。
这样的话，就可以实现自动化执行，因此我们只需要编写脚本就可以实现自动化部署。
```javascript
ssh blog@xx.xx.xxx.xxx 'sh /home/blog/app/bin/deploy.sh'
```

```javascript
docker start efe2   开启数据库容器
cd /home/blog/app/  进入app目录（pwd查看当前应用路径）

```

部署过程中的一些注意事项（报错）:
1. 之前的容器（不再使用的）占用了app名字，导致如下报错信息。
```javascript
 The container name "/app" is already in use by container "b443198f625818e3408ee892560fb419b61726fe95f2c2f645a9ab93a9d2a513". You have to remove (or rename) that container to be able to reuse that name.
```
以前的一些容器占用了这个名字，只需要清理一下即可。
```javascript
docker system prune
```
2. 如果是第一次运行容器，那么app容器不存在使用docker kill app会导致报错
解决办法：先删除docker kill xx和docker rm xx。等创建容器之后再加上。

3. 如果修改了.sh文件，那么每次修改后都得到远程服务器去拉取一下，否则它执行的脚本就不是最新的。

### 自动化部署最终使用
我们只需要执行下面的脚本即可。
```javascript

ssh blog@xx.xx.xxx.xxx 'sh /home/blog/app/bin/deploy.sh'
```

## 自动化部署数据库的问题
1. 本地使用的数据库在orm.config.json中的host,database和线上都是不一致的(根本原因是json不支持动态配置)。因此我们最好分别在本地
和线上都维护一份。注意：名称都是orm.config.json，但是本地的修改加入.gitignore中，同时线上的ormconfig.json通过软链接来进行保存。这样的话就可以避免本地修改影响到线上。
```javascript
git ormconfig.json   // 删除远程的文件
.gitirnore/ormconfig.json    // 在.gitignore中天啊及ormconfig.json不纳入git版本控制
```
