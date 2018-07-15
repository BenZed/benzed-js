for d in ./packages/*
do
  ( echo updating $d; cd $d && npx ncu -u -a)
done
npm run bootstrap
