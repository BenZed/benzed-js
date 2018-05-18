for d in ./packages/*
do
  ( echo reinstalling $d; cd $d && npm i)
done
