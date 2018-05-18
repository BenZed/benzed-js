for d in ./packages/*
do
  ( echo building $d; cd $d && npm run build)
done
