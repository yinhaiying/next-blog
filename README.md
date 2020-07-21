# 使用 next.js 和 typeorm 搭建 blog

## 使用 docker 启动数据库

```javascript
docker run -v "blog-data":/var/lib/postgresql/data -p 5432:5432 -e POSTGRES_USER=blog -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres:12.2
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
npx typeorm migration:create -n CreatePost
```
