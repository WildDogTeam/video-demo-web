#!/bin/sh

scp pre:/data/www/wilddog-web-demo/demo/wilddogvideo/index.html ./bin/demo.html

scp ./bin/demo.html root@47.92.28.17:/data/www/blog/demo.html

rm -rf ./bin/demo.html
