/**
 * @module components/Entry
 * @desc 入口图标
 * @author ervinewell on 2017/7/31.
 */
import xs from 'xstream';
import { html } from 'snabbdom-jsx';

const intent = ({ DOM }) => xs.merge(
  DOM.select('.conan-entry').events('click')
    .mapTo({ type: 'OPEN_MODAL', payload: true })
);

const model = (actions, props = {}) => {
  const initialState = {
    totalBadgeNumber: 0
  };
  const { totalBadgeNumber$ } = props;
  const totalBadgeNumberReducer$ = totalBadgeNumber$
    .map(totalBadgeNumber => oldState => ({
      ...oldState,
      totalBadgeNumber
    }));
  
  return totalBadgeNumberReducer$
    .fold((state, reducer) => reducer(state), initialState);
};

const view = state$ => state$.map(state => (
  <div className="conan-entry">
    <div className="badge">{state.totalBadgeNumber}</div>
  </div>
));

export default (sources, props) => {
  const actions = intent(sources);
  const state$ = model(actions, props);
  const vdom$ = view(state$);
  return {
    DOM: vdom$,
    openModal$: actions.filter(({ type }) => type === 'OPEN_MODAL')
  };
};
