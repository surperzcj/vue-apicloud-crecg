let useDevServer = true

if (window.location.href.indexOf('http') !== 0) {
    useDevServer = false
}

// export const API_BASE_URL = useDevServer ? 'http://192.168.0.199:8081' : 'http://app.bjtkcloud.com'
export const API_BASE_URL = useDevServer ? 'http://47.110.143.33:8081' : 'http://39.104.187.113'
// export const API_BASE_URL = 'http://39.104.187.113:8082'
export const TERMINAL_HEADER_NAME = 'x-api-terminal'
// 数据库存储路径
export const DB_FILE_PATH = 'fs://crecg.db'
export const DEPARTMENTS = [
    { dpid: 5, dpname: '管理层' },
    { dpid: 6, dpname: '开发部' },
    { dpid: 15, dpname: '桥梁检测' },
    { dpid: 16, dpname: '监督检测' },
    { dpid: 10, dpname: '地灾防治' },
    // { dpid: 13, dpname: '公路及监测组' },
    { dpid: 14, dpname: '综合部' },
    // { dpid: 17, dpname: '铁路其他组' },
    // { dpid: 12, dpname: '专家组' },
    // { dpid: 11, dpname: '其他部门' }

].map(item => {
    item.text = item.dpname
    item.id = item.dpid
    return item
})

export const SELF_UNITS = [
    { text: '检测中心', id: 2, status: 'normal' },
    { text: '铁建所', id: 3, status: 'normal' },
    { text: '铁科院', id: 4, status: 'normal' },
    { text: '铁峰所', id: 19, status: 'normal' },
]

export const PROJECT_PROGRESS_LIB = {
    NEW: { id: 1, name: '对接合同', options: null },
    APPROVING: { id: 2, name: '审批中', options: ['等待我方审批', '等待对方审批', '双方均审批完成'] },
    SIGNING: { id: 3, name: '签订中', options: ['等待我方签订', '等待对方签订', '双方均审批签订'] },
    BID: { id: 4, name: '招投标', options: ['中标', '未中标'] },
    ENTRUST: { id: 7, name: '委托洽谈', options: ['已委托', '未委托'] },
    UNRETURN: { id: 10, name: '未返回', options: null },
    PLAN: { id: 11, name: '方案状态', options: null },
    START: { id: 12, name: '启动项目', options: null },
    OUTSIDE: { id: 13, name: '外业', options: null },
    INSIDE: { id: 14, name: '内业', options: null },
    REPORT: { id: 15, name: '内审', options: null },
    PROGRESS_SUCCEED: { id: 16, name: '成果资料提交', options: null },
    CONCRACT_BUILD: { id: 17, name: '合同拟定', options: null },
    FINSIHED: { id: 18, name: '已归档', options: ['未返回', '已归档'] }
}

export const LAYOUT_HEADER_HEIGHT = 44
export const LAYOUT_FOOTER_HEIGHT = 50
