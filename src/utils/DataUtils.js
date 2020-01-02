import {AxiosRequest} from './AxiosRequest'
import {API_BASE_URL, TERMINAL_HEADER_NAME} from '../ProjectContants'
import {apiReady, sendEvent, toast} from './ApiCloudUtils'
import {getUserData, getUserToken, saveUserData} from './CacheUtils'

const checkNeedLogin = async r => {
  if (r.c !== 401) {
    return r
  }

  saveUserData(null)
  await apiReady()

  setTimeout(() => {
    sendEvent('user_logout')
    if (window.api.winName === 'root') {
    } else {
      window.api.closeToWin({ name: 'root' })
    }
  }, 500)
}

const getData = async (url, params = {}, headers = {}) => {
  headers['x-access-token'] = headers['x-access-token'] || getUserToken()
  let r = await AxiosRequest.get(API_BASE_URL + url, params, headers)
  if (r.c !== 0) {
    toast(r.m)
    // toast(r.m + ' ' + url);
  }
  return checkNeedLogin(r)
}
const deleteData = async (url, params = {}, headers = {}) => {
  headers['x-access-token'] = headers['x-access-token'] || getUserToken()
  let r = await AxiosRequest.delete(API_BASE_URL + url, params, headers)
  if (r.c !== 0) {
    toast(r.m)
  }
  return checkNeedLogin(r)
}

const putData = async (url, params, headers = {}) => {
  headers['x-access-token'] = headers['x-access-token'] || getUserToken()
  let r = await AxiosRequest.put(API_BASE_URL + url, params, headers)
  if (r.c !== 0) {
    toast(r.m)
  }
  return checkNeedLogin(r)
}

const postData = async (url, params, headers = {}) => {
  headers['x-access-token'] = headers['x-access-token'] || getUserToken()
  let r = await AxiosRequest.post(API_BASE_URL + url, params, headers)
  if (r.c !== 0) {
    toast(r.m)
  }
  return checkNeedLogin(r)
}

// 登录
export const login = (mobile, password) => {
  let headers = {}
  headers[TERMINAL_HEADER_NAME] = 2
  return AxiosRequest.post(API_BASE_URL + '/api/login', {
    mobile, password
  }, headers)
}

// 登出
export const logout = () => deleteData('/api/login')

// 获取管理用户列表
export const getManageUsers = async (mobile, departmentId, pageNumber, getButtons = false) => {
  return getData('/api/manage/users', {
    mobile, pageNumber, departmentId, getButtons
  })
}

// 获取用户注册审批
export const getUserRegisterApproves = async (mobile, status, pageNumber, getButtons = false) => {
  return getData('/api/manage/registers', {
    mobile, pageNumber, status, getButtons
  })
}

// 获取项目列表
export const getProjects = async form => getData(`/api/projects`, form)
// 获取跟踪项目筛选条件-部门
export const getDepartments = async form => getData(`/api/project/track/params/departments`, form)
// 获取跟踪项目筛选条件-人员
export const getUsers = async form => getData(`/api/project/track/params/users`, form)

// 获取项目统计情况
export const getProjectStatistic = async form => getData('/api/projects/statistic', form)

// 修改用户
export const editUser = async (userId, departmentId, active) => {
  return putData(`/api/manage/user/${userId}`, {
    departmentId, active
  })
}

// 重置用户密码
export const resetUserPassword = async userId => {
  return postData(`/api/manage/user/${userId}/password/reset`)
}

// 审批用户注册
export const approveUserRegister = async (userId, departmentId, agree) => {
  return postData(`/api/manage/user/${userId}`, { departmentId, agree })
}

// 获取创建项目的配置
export const getProjectSettings = async () => getData('/api/project/settings')

// 创建项目
export const createProject = async form => postData('/api/project', form)
// 获取路局
export const getBureaus = async form => getData('/api/project/bureaus', form)

// 获取项目详情
export const getProject = async projectId => getData(`/api/project/${projectId}`)

// 获取项目分享
export const getProjectShare = async projectId => getData(`/api/project/${projectId}/shares`)

// 修改项目分享
export const modifyProjectShare = async (projectId, usersId) => {
  return postData(`/api/project/${projectId}/share`, {
    usersId: usersId.join(',')
  })
}

// 修改项目内容
export const editProject = async form => postData(`/api/project/${form.jpid}`, form)

// 删除项目
export const removeProject = async projectId => deleteData(`/api/project/${projectId}`)

// 获取项目进度
export const getProjectProgresses = async projectId => getData(`/api/project/${projectId}/progresses`)

// 获取合同管理
export const getProjectContracts = async projectId => getData(`/api/project/${projectId}/contract`)

// 项目进度，下一步
export const projectNextProgress = async (projectId, progressId, value) => {
  return postData(`/api/project/${projectId}/progress/next`, {
    progressId, value
  })
}

// 项目进度，上一步
export const projectRollbackProgress = async (projectId, progressId) => {
  return postData(`/api/project/${projectId}/progress/rollback`, {
    progressId
  })
}

// 项目进度上传文件
export const uploadProjectProgressFile = async (projectId, progressId, key, name) => {
  return postData(`/api/project/${projectId}/progress/${progressId}/file`, {
    key, name
  })
}

// 项目进度删除文件
export const removeProjectProgressFile = async (projectId, progressId, fileId) => {
  return deleteData(`/api/project/${projectId}/progress/${progressId}/file/${fileId}`)
}

// 获取注册可用的用户
export const getRegisteredUsers = () => getData('/api/users/registered')

// 创建项目参与人
export const createProjectMember = (projectId, users) => postData(`/api/project/${projectId}/member`, JSON.stringify(users))

// 删除项目参与人
export const removeProjectMember = (projectId, pmid) => deleteData(`/api/project/${projectId}/member/${pmid}`)

// 获取进款
export const getProjectIncomes = projectId => getData(`/api/project/${projectId}/incomes`)

// 创建进款
export const createProjectIncome = (projectId, time, money) => postData(`/api/project/${projectId}/income`, {
  time, money
})

// 删除进款
export const removeProjectIncome = (projectId, incomeId) => deleteData(`/api/project/${projectId}/income/${incomeId}`)

// 获取开票列表
export const getProjectInvoices = projectId => getData(`/api/project/${projectId}/invoices`)

// 添加发票
export const createProjectInvoice = (projectId, form) => postData(`/api/project/${projectId}/invoice`, form)

// 删除发票
export const removeProjectInvoice = (projectId, pinid) => deleteData(`/api/project/${projectId}/invoice/${pinid}`)

// 修改发票
export const amendProjectInvoice = (projectId, id, form) => putData(`/api/project/${projectId}/invoice/${id}`, form)

// 获取活动列表
export const getProjectActivities = projectId => getData(`/api/project/${projectId}/activities`)

// 删除活动
export const removeProjectActivity = (projectId, activityId) => deleteData(`/api/project/${projectId}/activity/${activityId}`)

// 创建活动
export const createProjectActivity = (projectId, form) => {
  let params = JSON.parse(JSON.stringify(form))
  params.members = params.members.join(',')

  return postData(`/api/project/${projectId}/activity2`, params)
}

// 获取忘记密码的短信验证码
export const getForgotSms = mobile => getData('/api/forgot/sms', { mobile })

// 忘记密码提交
export const resetPassword = form => postData('/api/forgot', form)

// 获取注册的短信验证码
export const getRegisterSms = mobile => getData('/api/register/sms', { mobile })

// 注册
export const userRegister = form => postData('/api/register', form)

// 获取项目支出
export const getProjectSpends = projectId => getData(`/api/project/${projectId}/spends`)

// 创建项目支出
export const createProjectSpend = (projectId, form) => postData(`/api/project/${projectId}/spend`, form)

// 删除项目支出
export const removeProjectSpend = (projectId, psid) => deleteData(`/api/project/${projectId}/spend/${psid}`)

// 获取地区统计
export const getAreaProjectCounts = () => getData('/api/areas/project/counts')

// 获取用户信息
export const getUserInfo = () => getData('/api/profile')

// 项目移交
export const turnProject = (jpid, userId) => postData(`/api/project/${jpid}/turn`, { userId })

// 获取项目跟踪记录
export const getProjectTracks = jpid => getData(`/api/project/${jpid}/tracks`, { jpid })

// 创建项目跟踪记录
export const createProjectTrack = (jpid, remark) => postData(`/api/project/${jpid}/track/remark`, { remark })

// 编辑项目跟踪记录
export const editProjectTrack = (jpid, jptrid, remark) => putData(`/api/project/${jpid}/track/remark/${jptrid}`, { remark })

// 删除项目跟踪记录
export const removeProjectTrack = (jpid, jptrid) => deleteData(`/api/project/${jpid}/track/remark/${jptrid}`)

// 操作项目跟踪结果
export const trackProjectResult = (jpid, succeed) => postData(`/api/project/${jpid}/track/${succeed ? 'succeed' : 'fail'}`)

// 创建进度备注
export const createProgressRemark = (jpid, jprogid, remark) => postData(`/api/project/${jpid}/progress/${jprogid}/remark`, { remark })

// 修改进度备注
export const editProgressRemark = (jpid, jprogid, jptrid, remark) => putData(`/api/project/${jpid}/progress/${jprogid}/remark/${jptrid}`, { remark })

// 删除进度备注
export const removeProgressRemark = (jpid, jprogid, jptrid) => deleteData(`/api/project/${jpid}/progress/${jprogid}/remark/${jptrid}`)

// 设置进度计划时间
export const setProgressPlanTime = (jpid, form) => postData(`/api/project/${jpid}/progress/plan`, form)

// 修改头像
export const editProfileAvatar = key => putData(`/api/profile/avatar/${key}`)

// 指定项目负责人
export const markProjectIncharge = (jpid, incharge, dpid) => postData(`/api/project/${jpid}/mark`, {
  jpid,
  incharge,
  dpid
})

// 获取项目操作记录
export const getProjectRecords = jpid => getData(`/api/project/${jpid}/records`)

// 项目款清
export const projectContractMoneyClear = jpid => postData(`/api/project/${jpid}/incomes/clear`)

// 计算项目数量
export const getProjectCounts = () => getData('/api/project/count')

// 删除用户
export const removeUser = id => deleteData(`/api/user/${id}`)

// 获取用户未读红点
export const notifyCount = async () => getData(`/api/message/notify/count`)
