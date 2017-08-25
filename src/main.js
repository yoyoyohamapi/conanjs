/**
 * @module conan
 * @desc 入口文件
 * @author ervinewell on 2017/7/31.
 */

import xs from 'xstream';
import { run } from '@cycle/run';
import { makeDOMDriver } from '@cycle/dom';
import {html} from 'snabbdom-jsx';
import './scss/index.scss';

import Modal from './widgets/Modal';
import Tab from './widgets/Tab';
import JSError from './components/JSError';
import Console from './components/Console';
import NetWork from './components/NetWork';

import Entry from './components/Entry';

export default (params) => {
  const {
    tagHttpRequest
  } = params;
  
  const main = ({ DOM }) => {
    // 引入组件
    const jsErrorSink = JSError({ DOM });
    const netWorkSink = NetWork({ DOM }, { tagHttpRequest });
    const consoleSink = Console({ DOM });
    const tabSink = Tab({ DOM }, {
      tabBodyList: [
        {
          DOM: jsErrorSink.DOM,
          badgeNum$: jsErrorSink.errNum$
        },
        {
          DOM: netWorkSink.DOM,
          badgeNum$: netWorkSink.errNum$
        },
        {
          DOM: consoleSink.DOM,
          badgeNum$: consoleSink.badgeNum$,
          badgeType: 'normal'
        }
      ]
    });
    const modalSink = Modal({ DOM }, {
      content: tabSink.DOM
    });
    const entrySink = Entry({ DOM }, {
      totalBadgeNumber$: xs.combine(jsErrorSink.errNum$, netWorkSink.errNum$)
        .map(([jsErrorNum, netWorkErrorNumber]) => jsErrorNum + netWorkErrorNumber)
    });
    
    // 数据处理/整合状态
    const modalState$ = ((_actions) => {
      const { openModal$, closeModal$ } = _actions;
      const initialState = {
        visible: false
      };
      
      const visibleReducer$ = xs.merge(openModal$, closeModal$)
        .map(action => oldState => ({
          ...oldState,
          visible: action.payload
        }));
      
      return visibleReducer$
        .fold((state, reducer) => reducer(state), initialState);
    })({
      openModal$: entrySink.openModal$,
      closeModal$: modalSink.closeModal$
    });
    
    // 渲染
    const vdom$ = xs.combine(
      modalSink.DOM, entrySink.DOM,
      modalState$
    ).map(([modalVDOM, entryVDom, modalState]) => {
      const modalVisible = modalState.visible;
      return (
        <div className=".conan-wrapper">
          {entryVDom}
          {modalVisible ? modalVDOM : ''}
        </div>
      )
    });
    
    return { DOM: vdom$ };
  };
  
  const drivers = {
    DOM: makeDOMDriver('#conan')
  };
  run(main, drivers);
};
