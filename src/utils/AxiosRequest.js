import axios from "axios";
import qs from "qs";

/**
 * 封装axios请求
 */
export class AxiosRequest {
  /**
   * 构造函数
   * @param {String} url 请求地址
   * @param {String} [method] 请求方法
   * @param {Object} [params] 请求参数
   * @param {Object} [headers] 请求头部信息
   */
  constructor(url, method = 'get', params = {}, headers = {}) {
    this.url = url;
    this.params = params;
    this.headers = headers;
    this.method = method.toLocaleUpperCase();
  }

  /**
   * 执行，运行请求
   * @return {Promise.<*>}
   */
  async run() {
    let result = null;
    let headers = Object.assign({'Content-Type': 'application/x-www-form-urlencoded'}, this.headers);
    let params = this.params;
    try {
      switch (this.method.toLowerCase()) {
        case 'post':// post请求
          if (typeof params !== 'string') {
            params = qs.stringify(this.params);
          }
          result = await axios.post(this.url, params, {
            headers
          });
          break;
        case 'get':// get请求
          result = await axios.get(this.url, {
            params: this.params,
            headers
          });
          break;
        case 'put':// get请求
          if (typeof params !== 'string') {
            params = qs.stringify(this.params);
          }
          result = await axios.put(this.url, params, {
            headers
          });
          break;
        case 'delete':// delete请求
          result = await axios.delete(this.url, {
            params: this.params,
            headers
          });
          break;
      }

    } catch (e) {
      result = {
        data: {
          c: 500,
          m: '系统异常，请联系管理员处理',
          d: null
        }
      };
    }

    return this._handleResponse(result);
  }

  /**
   * 处理结果数据
   * @param {Object} result
   * @return {*}
   * @private
   */
  _handleResponse(result) {
    let data = result.data;
    if (data.c === 401) {
      location.href = location.pathname + '#/login';
    }

    return data;
  }

  /**
   * 简单运行请求
   * @param {String} url 请求地址
   * @param {String} [method] 请求方法
   * @param {Object} [params] 请求参数
   * @param {Object} [headers] 请求头部信息
   * @return {Promise.<*>}
   */
  static async singleRun(url, method, params = {}, headers = {}) {
    let request = new AxiosRequest(url, method, params, headers);
    return await request.run();
  }

  /**
   * 简单的get请求
   * @param {String} url 请求地址
   * @param {Object} [params] 请求参数
   * @param {Object} [headers] 请求头部信息
   * @return {Promise.<*>}
   */
  static async get(url, params = {}, headers = {}) {
    return await this.singleRun(url, 'get', params, headers);
  }

  /**
   * 简单的post请求
   * @param {String} url 请求地址
   * @param {Object} [params] 请求参数
   * @param {Object} [headers] 请求头部信息
   * @return {Promise.<*>}
   */
  static async post(url, params = {}, headers = {}) {
    return await this.singleRun(url, 'post', params, headers);
  }

  /**
   * 简单的put请求
   * @param {String} url 请求地址
   * @param {Object} [params] 请求参数
   * @param {Object} [headers] 请求头部信息
   * @return {Promise.<*>}
   */
  static async put(url, params = {}, headers = {}) {
    return await this.singleRun(url, 'put', params, headers);
  }

  /**
   * 简单的post请求
   * @param {String} url 请求地址
   * @param {Object} [params] 请求参数
   * @param {Object} [headers] 请求头部信息
   * @return {Promise.<*>}
   */
  static async delete(url, params = {}, headers = {}) {
    return await this.singleRun(url, 'delete', params, headers);
  }
}
