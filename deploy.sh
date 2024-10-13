echo Removing /root/dev/WebNoiser/dist/
rm -r /root/dev/WebNoiser/dist/
echo Running NPM build... 
echo ======== web pack start ===============
(cd /root/dev/WebNoiser/ ; npm run build)
echo Remove /var/www/noisenook.net/html/*
rm -r /var/www/noisenook.net/html/*
echo ======= web pack end ================
echo Copy to /var/www/noisenook.net/html/
cp -r /root/dev/WebNoiser/dist/* /var/www/noisenook.net/html/

