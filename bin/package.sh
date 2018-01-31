#! /bin/bash


echo "Start to package project."

rm -rf dist
echo "npm install,please wait"
ln -s /data/npm/storage_www-demo/node_modules node_modules
npm install
echo "npm run build,please wait"
npm run build

mv dist/index.html dist/web-video-demo/
cp -r bin dist/web-video-demo
