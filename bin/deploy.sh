docker start efe2 &&
  cd /home/blog/app/ &&
  git pull &&
  yarn install --production=false &&
  yarn build &&
  git apply migrate.patch
yarn compile &&
  yarn migration:run &&
  git reset --hard HEAD &&
  docker build -t haiying/node-web-app . &&
  docker kill app &&
  docker rm app &&
  docker run --name app --network=host -p 3000:3000 -d haiying/node-web-app &&
  echo 'OK'
