
echo  "\n"
echo Pulling latest master
git pull
echo  "\n"
echo "Removing /root/dev/WebNoiser/dist/ \n"
rm -r /root/dev/WebNoiser/dist/
echo Running NPM build... 
(cd /root/dev/WebNoiser/ ; npm run build)
echo  "\n"
echo Remove /var/www/noisenook.net/html/
rm -r /var/www/noisenook.net/html/*
echo  "\n"
echo Copy to /var/www/noisenook.net/html/
cp -r /root/dev/WebNoiser/dist/* /var/www/noisenook.net/html/
echo  "\n"

