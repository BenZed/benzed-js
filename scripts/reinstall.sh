for d in ./packages/*
do
  ( echo reinstalling $d; cd $d; rm -rf node_modules; rm package-lock.json; npm i)
done
