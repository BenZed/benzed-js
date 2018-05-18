for d in ./packages/*
do
  ( echo installing $d; cd $d && npm i)
done
