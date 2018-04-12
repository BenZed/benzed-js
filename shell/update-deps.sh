for d in ./packages/*
do
  ( echo updating $d; cd $d && npx ncu -u -a)
done
npx ncu -u -a
lerna bootstrap --hoist

npm run test
