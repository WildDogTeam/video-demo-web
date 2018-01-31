#!/bin/sh

npm run build

scp -r dist/www-demo/* pre:/data/www/wdstatic.cn/web-video-demo/

scp dist/index.html pre:/data/www/wilddog-web-demo/demo/wilddogvideo/
