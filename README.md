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
docker -U blog -W

```

- 执行 pg 命令行

```javascript
\l 用于list databases
\c 用于connect to a database
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
