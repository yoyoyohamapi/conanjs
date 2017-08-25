/**
 * @module components/JSError
 * @desc js错误显示栏
 * @author ervinewell on 2017/8/10
 */
import xs from 'xstream';
import isolate from '@cycle/isolate';
import _arrayPush from 'lodash/_arrayPush';
import { html } from 'snabbdom-jsx';

import List from '../widgets/List';

const makeIsolateList = DOM => (id, props) => {
  const listSink = isolate(List, id)({ DOM }, props);
  return {
    id,
    DOM: listSink.DOM
  };
};

const TITLE_LIST = [
  {
    key: 'msg',
    title: '信息'
  },
  {
    key: 'url',
    title: '网址'
  },
  {
    key: 'position',
    title: '位置'
  },
  {
    key: 'error',
    title: 'error对象'
  }
];

const intent = ({ DOM }) => xs.merge(
  DOM.select('#conan').events('JSError')
    .map(e => ({ type: 'ADD_JS_ERROR', payload: e.message }))
);

const model = (actions) => {
  const addItemReducer$ = actions
    .filter(action => action.type === 'ADD_JS_ERROR')
    .map((action) => {
      const { payload } = action;
      return prevList => _arrayPush(prevList, [{ ...payload, id: Date.now() }]);
    });
  
  return addItemReducer$.fold((list, reducer) => reducer(list), []);
};

const view = (state$, { IsolateList }) => {
  const listNodes$ = state$.map(childList =>
    childList.map(item =>
      IsolateList(item.id, {
        content: item,
        titleList: TITLE_LIST,
        renderCollapsedTitle: content => content.msg,
        renderType: () => 'error'
      }).DOM
    )
  );
  return listNodes$
    .map(listNodes => xs.combine(...listNodes).map(vDOMs => (
      <div className="js-error">
        {vDOMs}
      </div>
    )))
    .flatten();
};

export default (sources, props) => {
  const actions = intent(sources);
  const IsolateList = makeIsolateList(sources.DOM);
  const state$ = model(actions, props || {});
  const vdom$ = view(state$, { IsolateList });
  return {
    DOM: vdom$,
    errNum$: state$
      .map(childList => childList.length)
  };
};
