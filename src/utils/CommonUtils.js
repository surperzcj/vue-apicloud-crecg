import emojiJson from '../images/chat/emoticons/basic/basic.json'

/**
 * @example
 * ```js
 * var string = new Date(time).Format('yyyy-MM-dd hh:mm:ss')
 * ```
 * @param fmt
 * @return {*}
 */
Date.prototype.format = function (fmt) {
  let o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    'S': this.getMilliseconds() //毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (let k in o)
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
  return fmt
}

export const checkAndroid = () => (/android/gi).test(window.navigator.appVersion)

const localStorage = checkAndroid() && window.os && window.os.localStorage ? window.os.localStorage() : window.localStorage

// 获取存储数据
export const getStorage = key => {
  let value = localStorage.getItem(key)
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

// 设置存储数据
export const setStorage = (key, value) => {
  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }

  localStorage.setItem(key, value)
}

// 清空数据
export const clearStorage = () => {
  localStorage.clear()
}

export const formatDate = (ts, pattern = 'yyyy年MM月dd日') => {
  if (!(ts && ts > 0)) {
    return null
  }

  if (typeof ts !== 'number') {
    ts = parseInt(ts)
  }

  if (ts < Math.pow(10, 10)) {
    ts *= 1000
  }

  return new Date(ts).format(pattern)
}

export const parseTimestamp = date => {
  date = date.replace(/([年月])/g, '/').replace('日', '').replace(/-/g, '/')
  return new Date(date).getTime()
}

export const diffTimestampFormat = (diff, ts) => {
  diff = parseInt(diff)
  if (diff < 5) {
    return '刚刚'
  } else if (diff < 60) {
    return `${diff}秒前`
  }

  diff = Math.floor(diff / 60)
  if (diff < 60) {
    return `${diff}分钟前`
  }

  diff = Math.floor(diff / 60)
  if (diff < 24) {
    return `${diff}小时前`
  }

  diff = Math.floor(diff / 24)
  if (diff < 2) {
    return `昨天`
  }

  return formatDate(ts, 'MM/dd')
}

export const parseCreateProjectSettings = settings => {
  let newItem = { jcid: 'addNew', jcname: '其他' }

  settings.natures.push(newItem)
  settings.industries.push(newItem)
  settings.specialties.push(newItem)

  const parseCategory = item => {
    item.text = item.jcname
    item.id = item.jcid || item.value
  }

  settings.natures.forEach(parseCategory)
  settings.specialties.forEach(parseCategory)
  settings.sourceTypes.forEach(parseCategory)
  settings.industries.forEach(parseCategory)
  settings.areas.forEach(parseCategory)
  settings.departments.forEach(parseCategory)

  settings.inchargeUsers.forEach(item => {
    item.text = item.mobile
    item.left = item.juname
    item.status = 'normal'
    item.id = item.juid
  })
  settings.developUsers.forEach(item => {
    item.text = item.mobile
    item.left = item.juname
    item.status = 'normal'
    item.id = item.juid
  })
  settings.businessNatures = [
    { text: '中心经营+中心实施', id: 1 },
    { text: '中心经营+事业部实施', id: 2 },
    { text: '事业部经营+中心实施', id: 3 }
  ]
}


export const parseEmojiContent = content => {
  emojiJson.forEach(part => {
    part.emotions.forEach(item => {
      if (content.indexOf(item.text) > -1) {
        let emoji = `<img class="emoji" src="${window.api.wgtRootDir}/images/chat/emoticons/basic/${item.name}.png"/>`
        let regexp = new RegExp('\\' + item.text.replace(/\]/g, '\\]'), 'g')
        content = content.replace(regexp, emoji)
      }
    })
  })

  return content
}

export const concatUnique = (data, append, field) => {
  const ids = data.map(item => item[field])

  const items = append.filter(item => !ids.includes(item[field]))
  return data.concat(items)
}
