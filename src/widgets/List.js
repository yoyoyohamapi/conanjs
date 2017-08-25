/**
 * @module widgets/List
 * @desc 列表
 * @author ervinewell on 2017/8/10.
 */

import xs from 'xstream';
import { html } from 'snabbdom-jsx';

/**
 * props:
 * content [Object]
 * eg. { url: 'https://www.baidu.com' }
 * titleList [Array]
 * eg. [{ key: 'url', title: '地址' }]
 */
const TYPE_COLOR_MAP = {
  error: '#F4333C',
  success: '#108ee9',
  warning: '#FF5B05'
};

const intent = ({ DOM }) => xs.merge(
  DOM.select('.icon').events('click')
    .mapTo({ type: 'SWITCH_COLLAPSE' })
);

const model = (actions, props) => {
  const props$ = xs.of(props);
  const initialState = {
    content: {},
    titleList: [],
    collapsed: true
  };
  const userPropsReducer$ = props$
    .map(_props => function (oldState) {
      const { content, titleList, renderCollapsedTitle } = _props;
      let type = _props.type || 'success';
      
      if (typeof type === 'string') {
        type = {
          name: type,
          color: TYPE_COLOR_MAP[type]
        };
      }
      return {
        ...oldState,
        content,
        titleList,
        renderCollapsedTitle,
        type
      };
    });
  const switchCollapseReducer$ = actions.filter(action => action.type === 'SWITCH_COLLAPSE')
    .map(() => function (oldState) {
      return {
        ...oldState,
        collapsed: !oldState.collapsed
      };
    });
  return xs.merge(userPropsReducer$, switchCollapseReducer$)
    .fold((state, reducer) => reducer(state), initialState);
};

const view = state$ => state$.map((state) => {
  const { content, titleList, renderCollapsedTitle, type } = state;
  let Title = '';
  let Body = '';
  const collapsable = renderCollapsedTitle && renderCollapsedTitle instanceof Function;
  const collapsed = collapsable && state.collapsed;
  
  if (content instanceof Array && content.length) {
    Body = (
      <div className="list-body">
        {
          content.map(item => (
            <div className="item" key={Date.now()}>
              {item}
            </div>
          ))
        }
      </div>
    );
  }
  if (content instanceof Object && Object.keys(content).length) {
    Body = (
      <div className="list-body">
        {
          titleList.map((item) => {
            const key = item.key || item;
            return (
              <div className="item" key={key}>
                <div className="title">{item.title || key}</div>
                <div className="value">
                  {
                    item.render && (item.render instanceof Function)
                      ? item.render(content[key], content)
                      : (content[key] || '-')
                  }
                </div>
              </div>
            );
          })
        }
      </div>
    );
  }
  
  if (collapsable) {
    Title = renderCollapsedTitle(content);
  }
  return Body ? (
    <div className="conan-list">
      {
        Title ? (
          <div className="list-title" style={{ background: type.color }}>
            <div className="value">
              {Title}
            </div>
            <div className="icon">
              <div className="conan-arrow down" />
            </div>
          </div>
        ) : ''
      }
      {!collapsed ? Body : ''}
    </div>
  ) : <div />;
});

export default (sources, props) => {
  const actions = intent(sources);
  const state$ = model(actions, props || {});
  const vdom$ = view(state$);
  
  return {
    DOM: vdom$
  };
};
