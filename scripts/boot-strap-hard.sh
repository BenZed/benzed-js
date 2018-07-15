for d in ./packages/*
do
  ( echo clearing dependencies $d; cd $d; rm -rf node_modules; rm package-lock.json;)
done
rm -rf bootstrap/node_modules
npm run bootstrap
