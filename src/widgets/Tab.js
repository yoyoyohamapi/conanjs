/**
 * @module widgets/Tab
 * @desc 切换栏
 * @author ervinewell on 2017/8/8.
 */
import xs from 'xstream';
import classNames from 'classnames';
import {html} from 'snabbdom-jsx';

const TAB_LIST = ['JS错误', '网络请求', '控制台输出'];

const intent = ({ DOM }) => xs.merge(
  DOM.select('.tab-list-item').events('click')
    .map(e => {
      return ({ type: 'SWITCH_TAB', payload: e.currentTarget.dataset.index });
    })
);

const model = (actions) => {
  const initialState = { currentTabIndex: 0 };
  const switchTabReducer$ = actions.filter(({ type }) => type === 'SWITCH_TAB')
    .map(action => oldState => ({
      ...oldState,
      currentTabIndex: action.payload
    }));
  return switchTabReducer$
    .fold((state, reducer) => reducer(state), initialState);
};

const view = (state$, props) => {
  const { tabBodyList } = props;
  
  return state$
    .map((state) => {
      const { currentTabIndex } = state;
      const currentBody = tabBodyList[currentTabIndex];
      const currentBodyDOM$ = currentBody.DOM;
      const badgeNumList$ = xs.combine(...tabBodyList.map(item => item.badgeNum$));
      return xs.combine(badgeNumList$, currentBodyDOM$)
        .map(([badgeNumList, bodyDom]) => (
          <div className="tab">
            <div className="tab-list">
              {
                TAB_LIST.map((title, index) => (
                  <div
                    className={classNames('tab-list-item', {selected: Number(currentTabIndex) === index})}
                    attrs-data-index={index}
                  >
                    {title}
                    {
                      badgeNumList[index] > 0 ? (
                        <div className={classNames('badge', {normal: tabBodyList[index].badgeType === 'normal'})}>
                          {badgeNumList[index]}
                        </div>
                      ) : ''
                    }
                  </div>
                ))
              }
            </div>
            <div className="tab-body">{bodyDom}</div>
          </div>
        ));
  
    //   return currentBodyDOM$
    //     .map(bodyDom => (
    //       <div className="tab">
    //         <div className="tab-list">
    //           {
    //             TAB_LIST.map((title, index) => (
    //               <div
    //                 className={classNames('tab-list-item', {selected: Number(currentTabIndex) === index})}
    //                 attrs-data-index={index}
    //               >
    //                 {title}
    //               </div>
    //             ))
    //           }
    //         </div>
    //         <div className="tab-body">{bodyDom}</div>
    //       </div>
    //     ));
    })
    .flatten();
};

export default (sources, props) => {
  const actions = intent(sources);
  const state$ = model(actions, props || {});
  const vdom$ = view(state$, props || {});
  return {
    DOM: vdom$
  };
};
