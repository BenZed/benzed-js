for d in ./packages/*
do
  ( echo linking $d; cd $d && npm link)
done
