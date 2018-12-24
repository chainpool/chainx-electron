import React, { Component } from 'react';
import { _, classNames } from '../../../src/utils';
import { Scroller } from '../../components';
import * as styles from './index.less';

const createElement = _className => {
  return Props => {
    const { className, style, children, onClick } = Props;
    return (
      <div
        className={classNames({ [_className]: true }, className)}
        style={style}
        onClick={e => {
          _.isFunction(onClick) && onClick(e);
        }}>
        {children}
      </div>
    );
  };
};

const [Table, Thead, Tbody, Tr, Th, Td] = [
  createElement('table'),
  createElement('thead'),
  createElement('tbody'),
  createElement('tr'),
  createElement('th'),
  createElement('td'),
];

export default class TableComponent extends Component {
  constructor(props) {
    super(props);
    this._isMount = true;
    this.state = {
      x: 0,
      loadingMore: false, //加载更多的加载状态
      currentPage: 0,
      dataSource: this.props.dataSource,
    };
  }

  componentDidMount() {
    this.getPageData();
  }

  getPageData = () => {
    const { currentPage } = this.state;
    const { pagination: { onPageChange } = {} } = this.props;
    if (_.isFunction(onPageChange)) {
      onPageChange(currentPage + 1);
    }
  };

  clearIntervals = params => {
    if (params) {
      if (_.isArray(params)) {
        params.forEach(item => item && clearTimeout(item));
      } else {
        clearTimeout(params);
      }
    }
  };

  componentDidUpdate(prevProps) {
    const { dataSource: prevDataSource, columns: prevColumns } = prevProps;
    const { dataSource, columns } = this.props;
    if (!_.isEqual(prevDataSource, dataSource)) {
      this.changeState({
        dataSource,
      });
    }
    if (!_.isEqual(JSON.stringify(prevColumns), JSON.stringify(columns))) {
      this.changeState(
        {
          currentPage: 0,
        },
        this.getPageData
      );
    }
  }

  componentWillUnmount() {
    this._isMount = false;
    this.clearIntervals([this.interval, this.interval1, this.interval2]);
    window.onresize = null;
  }

  changeState = (payload, callback) => {
    if (this._isMount) {
      payload &&
        this.setState(payload, () => {
          _.isFunction(callback) && callback();
        });
      clearTimeout(this.interval1);
      this.interval1 = setTimeout(() => {
        this.scroller && this.scroller.refresh();
      }, 10);
    }
  };

  getScroller = scroller => {
    const { loadingMore } = this.props;
    if (!this.scroller && scroller) this.scroller = scroller;
    let prevX = 0;
    window.onresize = () => {
      this.changeState();
    };
    scroller.on('scroll', ({ x, y }) => {
      const { maxScrollY, movingDirectionY } = scroller;
      if (prevX !== x) {
        this.changeState({ x });
        prevX = x;
      }
      if (loadingMore && _.isFunction(loadingMore)) {
        if (y - maxScrollY < 3 && movingDirectionY === 1 && !this.state.loadingMore && !this.interval) {
          this.clearIntervals(this.interval, this.interval2);
          this.changeState({
            loadingMore: true,
          });
          this.interval = setTimeout(() => {
            loadingMore(() => {
              this.changeState({
                loadingMore: false,
              });
              this.interval2 = setTimeout(() => {
                this.interval = null;
              }, 700);
            });
          }, 100);
        }
      }
    });
  };

  calculateTableHeight = (
    dataSource,
    HeadTr = 40,
    bodyTr = 40,
    expandHeadTr = 40,
    expandBodyTr = 40,
    borderBottom = 1
  ) => {
    const { scroll: { y } = {} } = this.props;
    return y
      ? y + HeadTr
      : dataSource.reduce((sum, next = {}) => {
          const { expand = [] } = next;
          return (expand.length ? expand.length * expandBodyTr + expandHeadTr : 0) + sum;
        }, dataSource.length * (bodyTr + borderBottom) + (HeadTr + borderBottom));
  };

  render() {
    const { getPageData } = this;
    const {
      className = {},
      style = {},
      columns = [],
      expandedRowRender,
      onClickRow,
      noDataTip,
      pagination: { total: totalPage } = {},
    } = this.props;

    let { scroll = {}, scroll: { tr } = {}, tableHeight = [34, 48, 48, 48, 1] } = this.props;
    if (tr) {
      scroll.y = tr * (tableHeight[1] + tableHeight[4]) + tableHeight[4];
    }

    const getTdThProp = (item = {}) => {
      const style = item.width
        ? {
            width: item.width,
            minWidth: item.width,
            maxWidth: item.maxWidth,
          }
        : {
            width: `${(1 / (columns.length || 1)) * 100}%`,
            maxWidth: item.maxWidth,
            flexShrink: 1,
            flexGrow: 1,
          };
      return {
        style,
        className: classNames(_.isFunction(item.title) ? 'function' : null, item.className),
      };
    };

    const scrollerConfig = {
      getScroller: this.getScroller,
      scroll,
    };

    const { dataSource = [], currentPage } = this.state;
    return (
      <div
        style={{ height: this.calculateTableHeight(dataSource, ...tableHeight) }}
        className={classNames(styles.tableContainer, className)}>
        {_.isFunction(noDataTip) && noDataTip() ? (
          <div className="default">{noDataTip()}</div>
        ) : (
          <Table className={style.table}>
            <Thead style={{ left: this.state.x, minWidth: scroll.x }}>
              <Tr style={{ height: tableHeight[0] }}>
                {columns.map((item = {}, index) => (
                  <Th key={index} {...getTdThProp(item)}>
                    {_.isFunction(item.title) ? item.title() : item.title}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <div className={styles._scrollerTableContainer}>
              <div className={styles._scrollerTable}>
                <Scroller {...scrollerConfig}>
                  <Tbody>
                    {dataSource.map((item = {}, index) => {
                      return (
                        <React.Fragment key={index}>
                          <Tr
                            style={{ height: tableHeight[1] }}
                            className={classNames(index % 2 === 0 ? 'even' : 'odd')}
                            onClick={e => {
                              _.isFunction(onClickRow) && onClickRow(item, e);
                            }}>
                            {columns.map((item2 = {}, index2) => {
                              let result = '';
                              let className;
                              const key = item2.dataIndex;
                              let value = item[key];
                              if (_.isNaN(value) || _.isUndefined(value)) {
                                result = <span style={{ opacity: 0.5 }} />;
                              } else {
                                if (_.isFunction(item2.render)) {
                                  value = item2.render(value, item, index, dataSource);
                                }
                                if (_.isObject(value) && !_.has(value, '$$typeof')) {
                                  result = value.value;
                                  className = value.className;
                                } else {
                                  result = value;
                                }
                              }
                              return (
                                <Td
                                  key={index2}
                                  {...getTdThProp(item2)}
                                  className={classNames(item2.className, className)}>
                                  {item2.width || item2.ellipsis ? (
                                    <div className={styles.ellipsis}>{result}</div>
                                  ) : (
                                    result
                                  )}
                                </Td>
                              );
                            })}
                          </Tr>
                          {expandedRowRender && _.isFunction(expandedRowRender) ? expandedRowRender(item) : null}
                        </React.Fragment>
                      );
                    })}
                  </Tbody>
                  {/*{*/}
                  {/*loading ? (*/}
                  {/*<Loading.Circle loading={loading} isGlobal color={'#c1c1c1'} backgroundOpacity={0.01} />*/}
                  {/*) : null*/}
                  {/*}*/}
                  {/*{*/}
                  {/*loadingMore ? (<div className={styles.loadingmore} >加载更多......</div >) : null*/}
                  {/*}*/}
                </Scroller>
                {/*{totalPage && dataSource.length ? (*/}
                {/*<Pagination*/}
                {/*total={totalPage}*/}
                {/*currentPage={currentPage}*/}
                {/*onPageChange={value => {*/}
                {/*this.setState(*/}
                {/*{*/}
                {/*currentPage: value,*/}
                {/*},*/}
                {/*getPageData*/}
                {/*);*/}
                {/*}}*/}
                {/*/>*/}
                {/*) : null}*/}
              </div>
            </div>
          </Table>
        )}
      </div>
    );
  }
}
