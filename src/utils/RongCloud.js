import {toast} from './ApiCloudUtils'

export default class RongCloud {

  constructor () {
    this.client = window.api.require('rongCloud2')
  }

  init () {
    return new Promise(resolve => {
      this.client.init(ret => {
        console.log('rong-cloud2-init-result', JSON.stringify(ret, null, 4))
        console.log('rong-cloud2-init-result-success', ret.status !== 'error')
        resolve()
      })
    })
  }

  connect (token) {
    return new Promise(resolve => {
      this.client.connect({
        token
      }, ret => {
        console.log('rong-cloud2-connect-result', JSON.stringify(ret, null, 4))
        console.log('rong-cloud2-connect-result-success', ret.status !== 'error')
        resolve()
      })
    })
  }

  setOnReceiveMessageListener (callback) {
    this.client.setOnReceiveMessageListener(callback)
  }

  setMessageRead ({ messageId }) {
    this.client.setMessageReceivedStatus({
      messageId,
      receivedStatus: 'READ'
    }, ({ status }, error) => {
      if (status === 'error') {
        console.error('设置消息已读失败', JSON.stringify(error, null, 4))
      }
    })
  }

  setFriendPrivateTextMessage (targetId, text, extra) {
    return new Promise(resolve => {
      let message = null
      console.log('send message', JSON.stringify({
        conversationType: 'PRIVATE',
        targetId,
        text,
        extra: extra ? JSON.stringify(extra) : ''
      }, null, 4))

      this.client.sendTextMessage({
        conversationType: 'PRIVATE',
        targetId,
        text,
        extra: extra ? JSON.stringify(extra) : ''
      }, ({ status, result }, error) => {
        if (status === 'prepare') {
          message = result.message
          console.log('rongcloud-sendTextMessage-prepare', JSON.stringify(result.message, null, 4))
          resolve(message)
        } else if (status === 'success') {
          console.log('rongcloud-sendTextMessage-success', JSON.stringify(result.message))
          // resolve(message);
        } else if (status === 'error') {
          console.log('rongcloud-sendTextMessage-error code', error)
          toast('消息发送失败')
          alert(JSON.stringify(error, null, 4))
          resolve(null)
        }
      })
    })
  }
}
