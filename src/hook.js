/**
 * @module conan
 * @desc 核心逻辑-错误捕捉
 * @author ervinewell on 2017/8/2.
 */
import _pick from 'lodash/pick';
import _isArray from 'lodash/isArray';
import _isObject from 'lodash/isObject';
import _isPlainObject from 'lodash/isPlainObject';
import _isFunction from 'lodash/isFunction';
import { html } from 'snabbdom-jsx';

/* eslint-disable */
export default function ($conan) {
  const EVENT_LIST = ['JSError', 'NetWork', 'Console'];
  const events = {};
  
  for (let evType of EVENT_LIST) {
    events[evType] = new Event(evType);
  }
  
  // 统一发送监控信息
  const sendMessage = ({ type, message }) => {
    const ev = events[type];
    ev.message = message;
    $conan.dispatchEvent(ev);
  };
  
  // 监听js错误
  window.onerror = function (msg, url, lineNo, columnNo, error) {
    sendMessage({
      type: 'JSError',
      message: {
        msg,
        url,
        position: `第${lineNo}行左起第${columnNo}个字符`,
        error: JSON.stringify(error)
      }
    });
  };
  
  // 控制台输出信息
  (function (console) {
    const {log, time, timeEnd, error} = console;
    const formatObj = (m) => (
      <div>
        {
          m.split('\n').map(item => (
            <div>
              { item.split('').map(v => v === ' ' ? <span>&nbsp;</span> : v) }
            </div>
          ))
        }
      </div>
    );
    const formatMsg = (msg) => {
      const hint = (
        <span style={{color: 'darkgray', fontSize: '12px'}}>
          Object只能打印出非函数类型的属性
        </span>
      );
      if (_isArray(msg)) {
        return JSON.stringify(msg);
      }
      if (_isPlainObject(msg)) {
        return (
          <div>
            {hint}
            {formatObj(JSON.stringify(msg, null, 2))}
          </div>
        );
      }
      if (_isFunction(msg)) {
        return formatObj(msg.toString());
      }
      if (_isObject(msg)) {
        return (
          <div>
            <div>
              <strong>{msg.constructor.name}&nbsp;</strong>
              {hint}
            </div>
            {formatObj(JSON.stringify(msg, null, 2))}
          </div>
        );
      }
      return msg;
    };
    console.log = function (...args) {
      if (args[0] !== 'conan-inner-log') { // 不监听conan内部打印信息
        sendMessage({
          type: 'Console',
          message: [].map.call(args, formatMsg)
        });
      }
      log.call(this, ...args);
    };
    console.error = function (...args) {
      sendMessage({
        type: 'Console',
        tag: 'error',
        message: [].map.call(args, formatMsg)
      });
      error.call(this, ...args);
    };
    
    const timerMap = {};
    console.time = function (id = 'default') {
      timerMap[id] = Date.now();
      sendMessage({
        type: 'Console',
        message: [`timer-${id} start...`]
      });
      time.call(this, id);
    };
    console.timeEnd = function (id = 'default') {
      const now = Date.now();
      if (id in timerMap) {
        sendMessage({
          type: 'Console',
          message: [`timer-${id} end: ${now - timerMap[id]}ms`]
        });
        delete timerMap[id];
      } else {
        sendMessage({
          type: 'Console',
          tag: 'error',
          message: [`timer-${id}不存在`]
        });
      }
      timeEnd.call(this, ...args);
    };
  })(window.console);
  
  // 网络请求信息
  (function (XHR) {
    const { open, setRequestHeader, send } = XHR.prototype;
    
    XHR.prototype.open = function (...args) {
      const [method, url] = args;
      this.cnInfo = {};
      Object.assign(this.cnInfo, {
        id: Date.now(),
        url,
        method,
        headers: {}
      });
      open.call(this, ...args);
      
      this.onloadend = function () {
        const message = {
          ...this.cnInfo,
          ..._pick(this, ['status', 'timeout']),
          res: this.response || null,
          resURL: this.responseURL || null,
          headers: JSON.stringify(this.cnInfo.headers || {})
        };
        sendMessage({
          type: 'NetWork',
          message
        });
      };
    };
    
    XHR.prototype.setRequestHeader = function (...args) {
      const [key, value] = args;
      Object.assign(this.cnInfo.headers, { [key]: value });
      setRequestHeader.call(this, ...args);
    };
    
    XHR.prototype.send = function (body) {
      Object.assign(this.cnInfo, {body});
      send.call(this, body);
    };
  })(window.XMLHttpRequest);
  
  if ('fetch' in window && 'Request' in window) {
    const _fetch = window.fetch;
    
    window.fetch = function (...args) {
      const message = {};
      
      switch (args.length) {
        case 1: {
          if (args[0] instanceof Request) {
            const { method, headers, url } = args[0];
            let headerMap = {};
            
            for(let key of headers.keys()) { // headers由Headers构造器生成
              headerMap[key] = headers.get(key);
            }
            Object.assign(message, {
              method,
              headers: JSON.stringify(headerMap),
              url
            });
          } else {
            Object.assign(message, {
              url: args[0],
              method: 'get'
            });
          }
          break;
        }
        case 2: {
          const [url, init] = args;
          Object.assign(message, { url, ...init, headers: JSON.stringify(init.headers || {}) });
          break;
        }
        default:
      }
      
      return _fetch.call(this, ...args)
        .then(res => {
          res.clone().json().then(data => {
            sendMessage({
              type: 'NetWork',
              message: { ...message, ...res, data }
            });
          });
          return res;
        })
        .catch(err => {
          sendMessage({
            type: 'NetWork',
            message: { ...message, error: err.message }
          });
          throw err;
        });
    };
  }
};