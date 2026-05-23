cd ./Server
node setup
cd ./lib
echo npm start > ../run.bat
echo pause >> ../run.bat
npx grunt default pack
pause