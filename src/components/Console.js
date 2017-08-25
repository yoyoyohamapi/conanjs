/**
 * @module components/Console
 * @desc 控制台显示栏
 * @author ervinewell on 2017/8/16
 */
import xs from 'xstream';
import innerLog from '$utils/innerLog';
import _arrayPush from 'lodash/_arrayPush';
import { html } from 'snabbdom-jsx';

const intent = ({ DOM }) => xs.merge(
  DOM.select('#conan').events('Console')
    .map((e) => {
      innerLog('***************', e);
      return ({
        type: 'ADD_CONSOLE_INFO',
        payload: e.message
      });
    })
);

const model = (actions) => {
  const addItemReducer$ = actions
    .filter(action => action.type === 'ADD_CONSOLE_INFO')
    .map((action) => {
      const { payload } = action;
      return prevList => _arrayPush(prevList, [{ payload }]);
    });
  
  return addItemReducer$.fold((list, reducer) => reducer(list), []);
};

const view = state$ => state$.map(childList => (
  <div className="console">
    {
      childList.map(item => (
        <div className="item" key={item.id}>
          {item.payload.map(v => <div>{v}</div>)}
        </div>
      ))
    }
  </div>
));

export default (sources, props) => {
  const actions = intent(sources);
  const state$ = model(actions, props || {});
  const vdom$ = view(state$);
  return {
    DOM: vdom$,
    badgeNum$: state$.map(childList => childList.length)
  };
};
