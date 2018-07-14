for d in ./packages/*
do
  ( echo transpiling $d; cd $d && npm run babel)
done
