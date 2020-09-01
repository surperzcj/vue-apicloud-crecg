// 检验api是否就位
import {API_BASE_URL} from '../ProjectContants'
import {getUserToken} from './CacheUtils'

const checkApiReady = callback => {
  if (typeof window.api !== 'undefined') {
    return callback(true)
  }

  setTimeout(() => {
    if (typeof window.api === 'undefined') {
      checkApiReady(callback)
    } else {
      openChromeDebug()
      callback(true)
    }
  }, 1)
}

// api已经就位
export const apiReady = () => {
  return new Promise(resolve => {
    checkApiReady(() => {
      resolve(true)
      openChromeDebug()
    })
  })
}

export const openChromeDebug = (log = false) => {
  try {
    let chromeDebug = window.api.require('chromeDebug')
    chromeDebug.openDebug(function (ret, err) {
      if (!log) {
        return
      }

      if (212 === ret.code || 1000 === ret.code) {
        console.log('open chromedebug success: ' + JSON.stringify(ret))
      } else {
        console.log('open chromedebug fail:' + JSON.stringify(err))
        console.log('open chromedebug fail: ' + JSON.stringify(ret))
      }
    })
  } catch (e) {
    if (log) {
      console.log('open chromedebug error:' + e.message)
    }
  }
}

// 获取页面参数
export const getPageParams = async () => {
  await apiReady()
  return window.api.pageParam
}

/**
 * @param {string} url 地址
 * @param {string} [title=''] 标题
 * @param {object} [query={}] 参数
 * @param {boolean} [showBack=true] 是否显示返回按钮
 * @param {boolean} [showBottom=false] 是否显示footer
 * @return {Promise<void>}
 */
export const openWindow = async (url, title, query, showBack = true, showBottom = false) => {
  await apiReady()

  let opts = {
    url: 'layout.html',
    name: url,
    pageParam: {
      url,
      header: {
        showBack: showBack,
        text: title || ''
      },
      showBottom: showBottom,
      query: query || {}
    }
  }

  window.api.openWin(opts)
}

/**
 * 打开子页面
 * @param url
 * @param headerHeight
 * @param query
 * @return {Promise<void>}
 */
export const openFrame = async (url, headerHeight = 0, query = {}) => {
  await apiReady()
  let opt = {
    name: url,
    url: url,
    rect: {
      x: 0,
      y: headerHeight,
      w: window.api.winWidth,
      h: window.api.winHeight - headerHeight
    },
    pageParam: query
  }
  console.log('openFrame', JSON.stringify(opt, null, 4))
  try {
    window.api.openFrame(opt, function () {
      console.log('open frame result', JSON.stringify(arguments, null, 4))
    })
  } catch (e) {
    console.log('open frame error', JSON.stringify(arguments, null, 4))
  }
}

/**
 * 打开窗口组
 * @param opts
 * @param callback
 * @return {Promise<void>}
 */
export const openFrameGroup = async (opts, callback) => {
  await apiReady()

  window.api.openFrameGroup(opts, callback)
}

/**
 * 设置窗口组显示界面
 * @param opts
 * @return {Promise<void>}
 */
export const setFrameGroupIndex = async (opts) => {
  await apiReady()
  window.api.setFrameGroupIndex(opts)
}

/**
 * 关闭window
 * @return {Promise<void>}
 */
export const closeWindow = async () => {
  await apiReady()
  window.api.closeWin()
}

export const sendEvent = async (name, extra) => {
  await apiReady()
  window.api.sendEvent({ name, extra })
}

export const addEventListener = async (name, callback) => {
  await apiReady()
  window.api.addEventListener({ name }, ({ value }) => callback(value))
}

export const toast = async message => {
  await apiReady()
  window.api.toast({
    msg: message,
    duration: 2000,
    location: 'bottom'
  })
}

export const pullRefresh = async (callback = new Promise(resolve => resolve)) => {
  await apiReady()

  window.api.removeEventListener({ name: 'scrolltobottom' })
  window.api.setRefreshHeaderInfo({
    // loadingImg: 'widget://image/refresh.png',
    bgColor: '#f8f8f8',
    textColor: '#666',
    textDown: '下拉刷新...',
    textUp: '松开刷新...'
  }, function () {
    callback && callback()
  })
}

export const pullRefreshDone = async () => {
  await apiReady()
  window.api.refreshHeaderLoadDone()
}

// 监听分页
export const listenPage = async (callback, scope = 100) => {
  await apiReady()
  window.api.addEventListener({
    name: 'scrolltobottom',
    extra: {
      threshold: scope           //设置距离底部多少距离时触发，默认值为0，数字类型
    }
  }, () => {
    window.api.removeEventListener({ name: 'scrolltobottom' })
    callback()
  })
}

// 确认框
export const confirm = async (msg = '', title = '提示') => {
  await apiReady()
  return new Promise(resolve => {
    window.api.confirm({
      title,
      msg,
      buttons: ['确定', '取消']
    }, ret => {
      resolve(ret.buttonIndex === 1)
    })
  })
}

// 确认框
export const showAlert = async (msg = '', title = '提示') => {
  await apiReady()
  return new Promise(resolve => {
    window.api.alert({
      title,
      msg
    }, ret => {
      resolve(ret.buttonIndex === 1)
    })
  })
}

// 打开提示框
export const openActionSheet = async (title, buttons, cancelTitle = '取消') => {
  await apiReady()

  return new Promise(resolve => {
    window.api.actionSheet({
      title, cancelTitle, buttons
    }, ({ buttonIndex }) => {
      resolve(buttonIndex)
    })
  })
}

// 选取照片或者照相
export const selectPicture = async () => {
  await apiReady()
  let index = await openActionSheet('选择图片', ['从相册选取', '拍照'])
  let type = null
  if (index === 1) {
    type = 'album'
  } else if (index === 2) {
    type = 'camera'
  } else {
    return null
  }

  return new Promise(resolve => {
    window.api.getPicture({
      sourceType: type,
      encodingType: 'jpg',
      mediaValue: 'pic',
      destinationType: 'url',
      allowEdit: true,
      quality: 100,
      targetWidth: 600,
      // targetHeight: 600,
      saveToPhotoAlbum: false
    }, (ret, err) => {
      if (ret) {
        console.log('获取图片', JSON.stringify(ret, null, 4))
        ret.url = ret.data
        ret.name = ret.url.split('/').pop()
        resolve(ret)
      } else {
        resolve(null)
        console.error('select picture error', err)
      }
    })
  })
}

// 下载文件
export const downloadFile = async (url, savePath) => {
  await apiReady()

  return new Promise(resolve => {
    window.api.download({
      url,
      savePath,
      report: false,
      cache: true,
      allowResume: true
    }, function (ret, err) {
      console.log(ret)
      // if (ret.state === 1) {
        //下载成功
        resolve(ret)
      // }
    })
  })
}

// 上传文件
export const uploadFile = async file => {
  await apiReady()
  return new Promise(resolve => {
    window.api.ajax({
      url: API_BASE_URL + '/api/upload',
      method: 'post',
      headers: {
        'x-access-token': getUserToken()
      },
      data: {
        files: {
          file
        }
      }
    }, (ret, err) => {
        console.log('err')
        console.log(err)
        console.log(ret)
      if (ret) {
        resolve(ret)
      } else {
        resolve({ c: -1, m: err.msg, d: null })
      }
    })
  })
}

// 打开文件浏览器
export const openFileBrowser = async () => {
  await apiReady()
  const fileBrowser = window.api.require('fileBrowser')

  return new Promise(resolve => {
    fileBrowser.open(function (ret) {
      if (ret) {
        // {"url":"/storage/emulated/0/360Log/downloadLog_delegate","name":"downloadLog_delegate","date":1512627798000,"size":4800}
        resolve(ret)
      } else {
        resolve(null)
      }

      fileBrowser.close()
    })
  })
}

// 打开照片查看器
export const openPhotoViewer = async (...images) => {
  await apiReady()
  const photoBrowser = window.api.require('photoBrowser')
  photoBrowser.open({
    images,
    bgColor: '#000'
  }, (ret, err) => {
    if (ret) {
      if (ret.eventType === 'click') {
        photoBrowser.close()
      }
    } else {
      console.error(JSON.stringify(err))
    }
  })
}

export const openDocReader = async url => {
  await apiReady()
  let path = 'fs://download/' + url.split('/').pop()

  const fs = window.api.require('fs')
  if (!fs.existSync({ path: 'fs://download' }).exist) {
    fs.createDirSync({ path: 'fs://download' })
  }

  if (!fs.existSync({ path }).exist) {
    toast('开始下载文件，请稍后...')
    await downloadFile(url, path)
  }

  const docReader = window.api.require('docReader')
  docReader.open({
    path
  }, function (ret, err) {
    if (err && err.code === '2') {
      toast('不支持该文件的预览')
    } else if (err) {
      console.error('openDocReader error', JSON.stringify(err, null, 4))
    }
  })
}
