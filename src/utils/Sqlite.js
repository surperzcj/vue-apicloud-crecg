import {DB_FILE_PATH} from '../ProjectContants'
import {apiReady} from './ApiCloudUtils'
import {getUserData} from './CacheUtils'

const name = 'crecg_1'

const SQL_CREATE_TABLE_MESSAGE = `
CREATE TABLE IF NOT EXISTS jl_message (
    messageId bigint primary key not NULL,
    objectName varchar(100) NOT NULL,
    receivedTime bigint  NOT NULL,
    senderUserId varchar(20) NOT NULL,
    sentStatus varchar(50) NOT NULL,
    sentTime bigint not null,
    targetId varchar(20) not null,
    contentText varchar(250) not null,
    contentExtra text not null,
    contentType varchar(20) not null,
    created bigint not null,
    read boolean not null default '0',
    readTime bigint not null default '0'
);
`

const SQL_CREATE_TABLE_MESSAGE_TITLE = `
CREATE TABLE IF NOT EXISTS jl_message_title (
    targetUserId varchar(20) not null,
    userId varchar(20) not null,
    updated bigint not null,
    messageId bigint not null,
    unread int not null default '0',
    primary key (targetUserId, userId)
);
`

const SQL_CREATE_TABLE_CACHE = `
CREATE TABLE IF NOT EXISTS jl_message_cahces (
    key varchar(100) primary key not null,
    text text,
    expire bigint not null
);
`

const buildSqlInsertMessage = ({
                                 messageId, objectName, receivedTime, senderUserId, sentStatus,
                                 sentTime, targetId, contentText, contentExtra, contentType,
                                 created, read = 0, readTime = 0,
                                 content
                               }) => {
  if (!created) {
    created = new Date().getTime()
  }

  if (content) {
    contentText = contentText || content.text
    contentExtra = contentExtra || content.extra
  }

  if (typeof contentExtra !== 'string') {
    contentType = contentType || contentExtra.type
    contentExtra = JSON.stringify(contentExtra)
  } else {
    try {
      contentType = contentType || JSON.parse(contentExtra).type
    } catch (e) {
      contentType = 0
    }
  }

  return `INSERT INTO jl_message(
    messageId, objectName, receivedTime, senderUserId, sentStatus, 
    sentTime,  targetId,   contentText,  contentExtra, contentType,
    created,   read,       readTime
  ) VALUES (
    ${messageId}, '${objectName}', ${receivedTime}, '${senderUserId}', '${sentStatus}',
    ${sentTime}, '${targetId}', '${contentText}', '${contentExtra}', '${contentType}',
    ${created}, ${read}, ${readTime}
  );`
}

class Sqlite {

  constructor () {
    this.sqlite = window.api.require('db')
    this.openDatabase()
  }

  openDatabase () {
    let { status, code, msg } = this.sqlite.openDatabaseSync({ name, path: DB_FILE_PATH })
    // console.log('sqlite', 'open sqlite result', status, code, msg);
    this.initDatabase()
  }

  initDatabase () {
    // this.execute('DROP TABLE IF EXISTS jl_message');
    // this.execute('DROP TABLE IF EXISTS jl_message_title');
    this.execute(SQL_CREATE_TABLE_MESSAGE)
    this.execute(SQL_CREATE_TABLE_MESSAGE_TITLE)
    this.execute(SQL_CREATE_TABLE_CACHE)
  }

  beginTransaction () {
    this.sqlite.transactionSync({ name, operation: 'begin' })
  }

  commitTransaction () {
    this.sqlite.transactionSync({ name, operation: 'commit' })
  }

  rollbackTransaction () {
    this.sqlite.transactionSync({ name, operation: 'rollback' })
  }

  execute (sql) {
    // console.log('sqlite', `executing sql = ${sql}`);
    let { status, code, msg } = this.sqlite.executeSqlSync({ sql, name })
    // console.log('sqlite', `executing sql result ${status ? 'succeed' : 'failed'}, code=${code}, msg=${msg}`);

    return status
  }

  select (sql) {
    // console.log('sqlite', `selecting sql = ${sql}`);
    let { status, data, code, msg } = this.sqlite.selectSqlSync({ sql, name })
    // console.log('sqlite', `select sql result  ${status ? 'succeed' : 'failed'}, code=${code}, msg=${msg}`);

    return { status, data }
  }
}

let sqliteClient = null

export const getSqliteClient = async () => {
  await apiReady()
  if (sqliteClient == null) {
    sqliteClient = new Sqlite()
  }

  return sqliteClient
}

export const insertMessageToDb = async message => {
  let { userId } = getUserData()

  if (message.conversationType === 'SYSTEM') {
    message.targetId = userId
    message.senderUserId = 'system'
  } else if (message.conversationType === 'PRIVATE' && message.messageDirection === 'RECEIVE') {
    message.targetId = userId
  }
  try {
    message.content = JSON.parse(message.content)
  } catch (e) {
  }

  if (message.objectName === 'RC:ImgMsg') {
    message.content.extra = message.content.extra || {}
    try {
      message.content.extra = JSON.parse(message.content.extra)
    } catch (e) {
    }

    if (typeof message.content.extra === 'object') {
      message.content.extra.imageUrl = message.content.imageUrl
      message.content.extra.thumbPath = message.content.thumbPath
    }
  }

  let client = await getSqliteClient()
  message.messageId = new Date().getTime()
  let sql = buildSqlInsertMessage(message)
  client.execute(sql)

  let targetUserId = message.targetId == userId ? message.senderUserId : message.targetId

  // 更新标题
  sql = `select * from jl_message_title where targetUserId='${targetUserId}' and userId='${userId}';`
  let { status, data } = client.select(sql)
  let unreadSql = `select count(*) from jl_message where read=0 and targetId='${userId}' and senderUserId='${targetUserId}'`
  if (data.length > 0) {
    sql = `update jl_message_title set updated=${new Date().getTime()}, messageId=${message.messageId},unread=(${unreadSql})
        where targetUserId='${targetUserId}' and userId='${userId}';`
  } else {
    sql = `insert into jl_message_title (targetUserId,userId,updated,messageId,unread) 
        values ('${targetUserId}','${userId}',${new Date().getTime()},${message.messageId},1)`
  }
  client.execute(sql)
  console.log('insert-finished')
}

export const getUserUnreadMessageNumber = async () => {
  let client = await getSqliteClient()
  let { userId } = getUserData()

  let { status, data } = client.select(`select sum(unread) as sum from jl_message_title where userId='${userId}'`)
  try {
    console.info('unread-number', data[0].sum)
    return data[0].sum
  } catch (e) {
    console.error(e)
    return 0
  }
}

export const getSqliteCacheData = async (key, checkExpire = true) => {
  let client = await getSqliteClient()

  let { status, data } = client.select(`select * from jl_message_cahces where key='${key}' limit 1`)
  if (!status || !data || data.length === 0) {
    return null
  }

  let target = data[0]
  if (checkExpire && target.expire > 0 && target.expire < new Date().getTime()) {
    return null
  }

  try {
    return JSON.parse(target.text)
  } catch (e) {
    return target.text
  }
}

export const setSqliteCacheData = async (key, data, expire = -1) => {
  const client = await getSqliteClient()
  if (expire !== -1) {
    expire = new Date().getTime() + expire * 1000
  }

  if (typeof data === 'object') {
    data = JSON.stringify(data)
  }

  let sql
  if (!await getSqliteCacheData(key, false)) {
    sql = `insert into jl_message_cahces(key,text,expire) values ('${key}', '${data}', ${expire})`
  } else {
    sql = `update jl_message_cahces set text='${data}',expire=${expire} where key='${key}'`
  }

  client.execute(sql)
}

export const getUserMessages = async () => {
  const client = await getSqliteClient()
  const { userId } = await getUserData()
  let sql = `
    select mt.*,m.* from jl_message_title mt
    left join jl_message m on mt.messageId=m.messageId
    where mt.userId='${userId}'
    order by mt.updated desc
  `
  let { status, data } = client.select(sql)
  return data
}

export const getMessagesWithTarget = async (targetUserId, page, limit) => {
  const client = await getSqliteClient()
  const { userId } = await getUserData()

  let sql = `select * from jl_message 
             where ( (senderUserId='${userId}' and targetId='${targetUserId}') or (senderUserId='${targetUserId}' and targetId='${userId}') )
             order by created desc
             limit ${(page - 1) * limit},${limit}
             `
  let { data } = client.select(sql)
  return data
}

export const getMessageGreaterThanMessageId = async (targetUserId, lastId) => {
  const client = await getSqliteClient()
  const { userId } = await getUserData()
  let sql = `select * from jl_message 
             where ( (senderUserId='${userId}' and targetId='${targetUserId}') or (senderUserId='${targetUserId}' and targetId='${userId}') )
             and messageId > ${lastId}
             order by created desc
             `
  let { data } = client.select(sql)
  return data
}

export const markTargetUserMessageAllRead = async targetUserId => {
  const client = await getSqliteClient()
  const { userId } = await getUserData()

  let sql = `update jl_message set read=1 where ( (senderUserId='${userId}' and targetId='${targetUserId}') or (senderUserId='${targetUserId}' and targetId='${userId}') );`
  client.execute(sql)

  sql = `update jl_message_title set unread=0 where targetUserId='${targetUserId}' and userId='${userId}'`
  client.execute(sql)
}

export const getFirstUnreadMessageId = async () => {
  const client = await getSqliteClient()
  const { userId } = await getUserData()

  let sql = `select messageId from jl_message where targetId = ${userId} and read = 0 order by created asc limit 1`
  let { data } = client.select(sql)

  return data && data[0] && data[0].messageId || 0
}

window.aksql = {
  async query (sql) {
    const client = await getSqliteClient()
    let { data } = await client.select(sql)
    console.table(data)
  }
}
