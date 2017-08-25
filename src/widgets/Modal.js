/**
 * @module widgets/Modal
 * @desc 全局弹窗
 * @author ervinewell on 2017/7/31.
 */
import xs from 'xstream';
import {html} from 'snabbdom-jsx';

const intent = ({ DOM }) => xs.merge(
  DOM.select('.close-icon').events('click')
    .mapTo({ type: 'CLOSE_MODAL', payload: false })
);

const model = () => xs.of({});

const view = (state$, props) => props.content.map(contentDOM => (
  <div className="conan-modal">
    <div className="close-icon">×</div>
    {contentDOM || 'no-content'}
  </div>
));

export default (sources, props) => {
  const actions = intent(sources);
  const state$ = model(actions, props || {});
  const vdom$ = view(state$, props || {});
  
  return {
    DOM: vdom$,
    closeModal$: actions.filter(({ type }) => type === 'CLOSE_MODAL')
  };
};
