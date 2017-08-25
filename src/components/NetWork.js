/**
 * @module components/NetWork
 * @desc 网络请求显示栏
 * @author ervinewell on 2017/8/16
 */
import xs from 'xstream';
import isolate from '@cycle/isolate';
import _arrayPush from 'lodash/_arrayPush';
import { html } from 'snabbdom-jsx';

import List from '../widgets/List';

const makeIsolateList = DOM => (id, props) => {
  const list = isolate(List, id)({ DOM }, props);
  return {
    id,
    DOM: list.DOM
  };
};

const TITLE_LIST = ['url', 'method', 'header', 'status', 'res', 'resURL', 'timeout'];

const intent = ({ DOM }) => xs.merge(
  DOM.select('#conan').events('NetWork')
    .map(e => ({ type: 'ADD_NETWORK_INFO', payload: e.message }))
);

const model = (actions) => {
  const initialState = [];
  const addItemReducer$ = actions
    .filter(action => action.type === 'ADD_NETWORK_INFO')
    .map((action) => {
      const { payload } = action;
      return prevList => _arrayPush(prevList, [{ ...payload, id: Date.now() }]);
    });
  
  return addItemReducer$.fold((list, reducer) => reducer(list), initialState);
};

const view = (state$, { IsolateList }, props = {}) => {
  const listNodes$ = state$.map(childList =>
    childList.map(item => {
      const { tagHttpRequest } = props;
      let type = 'normal';
      
      try {
        type = tagHttpRequest(item);
      } catch (e) {
        throw new Error(e.message);
      }
      return IsolateList(item.id, {
        content: item,
        titleList: TITLE_LIST,
        renderCollapsedTitle: content => `[${(content.method || 'GET').toUpperCase()}] ${content.url}`,
        type
      }).DOM
    })
  );
  return listNodes$.map(listNodes => xs.combine(...listNodes).map(vDOMs => (
    <div className="network">
      {vDOMs}
    </div>
  ))).flatten();
};

export default (sources, props) => {
  const actions = intent(sources);
  const IsolateList = makeIsolateList(sources.DOM);
  const state$ = model(actions);
  const vdom$ = view(state$, { IsolateList }, props);
  return {
    DOM: vdom$,
    errNum$: state$
      .map(childList => childList.reduce((prev, curr) => prev + Number(!curr.status), 0))
  };
};
