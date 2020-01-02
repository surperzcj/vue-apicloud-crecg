#!/usr/bin/env bash

svnPath=/Users/akun/workspace/items/ZhongTieYanJiuSuo/codes/BeiJingTieKe

clean () {
    rm -rf dist
}

package () {
    npm run build
}

upload () {
    rm -rf ${svnPath}/*.html
    rm -rf ${svnPath}/static
    rm -rf ${svnPath}/*.js
    rm -rf ${svnPath}/*.map
    rm -rf ${svnPath}/images

    cp -rf src/images dist/

    cp config.xml dist/
    cp -rf -v dist/* ${svnPath}/
    rm -rf ${svnPath}/*.map

    cd ${svnPath}

    svn add ./*
    svn commit -m 'publish'
}

clean
package
upload

echo '==================================================================='
echo '============ finished at' $(date) '============='
echo '==================================================================='
