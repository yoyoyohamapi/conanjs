/**
 * @module conan
 * @desc 主流程
 * @author ervinewell on 2017/8/16
 */
import _noop from 'lodash/noop';
import runner from './main';
import hook from './hook';

/* eslint-disable no-undef */
const bootstrap = (params = {}) => {
  // 获取定制信息
  const {
    tagHttpRequest = _noop
  } = params;
  
  // 创建根元素
  const $conan = document.createElement('div');
  $conan.id = 'conan';
  document.querySelector('body').appendChild($conan);
  
  // 拦截原生js方法
  hook($conan);
  
  // cycle runner
  runner({
    tagHttpRequest
  });
};

window.conan = bootstrap;
