import React, { Component } from 'react';
import { _, classNames } from '../../../src/utils';
import { Scroller, Pagination } from '../../components';
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
    this.action = '_action'; //区分出操作列
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
      onPageChange(currentPage);
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
    if (
      !_.isEqual(JSON.stringify(prevColumns), JSON.stringify(columns)) ||
      !_.isEqual(_.get(prevProps, 'location.search'), _.get(this.props, 'location.search'))
    ) {
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
    borderBottom = 1,
    options = {
      showHead: true,
      scroll: {},
    }
  ) => {
    const { scroll: { y } = {}, showHead = true } = options;

    if (!showHead) {
      HeadTr = 0;
    }
    // 注意tr border 的1px 都在height里面啦(css border-box模式)，不用再算一次
    return y
      ? y + HeadTr
      : dataSource.reduce((sum, next = {}) => {
          const { expand = [], expandIsOpen } = next;
          // 暂时只能支持一层展开
          return (
            (expand.length && expandIsOpen
              ? this.calculateTableHeight(expand, expandHeadTr, expandBodyTr, 0, 0, 1, { showHead: false })
              : 0) + sum
          );
          // return (expand.length ? expand.length * expandBodyTr + expandHeadTr : 0) + sum;
        }, dataSource.length * bodyTr + (HeadTr + borderBottom));
  };

  render() {
    const {
      className = {},
      style = {},
      columns = [],
      expandedRowRender,
      onClickRow,
      noDataTip,
      pagination: { total: totalPage } = {},
      showHead = true,
      activeTrIndex,
      children,
    } = this.props;

    let { scroll = {}, scroll: { tr } = {}, tableHeight = [] } = this.props;
    tableHeight = [
      tableHeight[0] || 34, // head
      tableHeight[1] || 48, // body tr
      tableHeight[2] || 48, // expand head
      tableHeight[3] || 48, // expand tr
      tableHeight[4] || 1, // tr border
    ];

    if (tr) {
      // 注意tr border 的1px 都在height里面啦(css border-box模式)，不用再算一次
      scroll.y = tr * tableHeight[1] + tableHeight[4];
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
        className: classNames(
          _.isFunction(item.title) ? 'function' : null,
          _.isFunction(item.className) ? item.className() : item.className
        ),
      };
    };

    const scrollerConfig = {
      getScroller: this.getScroller,
      scroll,
    };

    const { dataSource = [], currentPage } = this.state;
    const height = this.calculateTableHeight(dataSource, ...tableHeight, { showHead, scroll });
    return (
      <div
        // style={{ height: totalPage ? 52 + height : height }}
        className={classNames(styles.tableContainer, className)}>
        {_.isFunction(noDataTip) && noDataTip() && !dataSource.length ? (
          <div className="default">{noDataTip()}</div>
        ) : (
          <>
            <Table className={style.table} style={{ height: height }}>
              {showHead ? (
                <Thead style={{ left: this.state.x, minWidth: scroll.x }}>
                  <Tr style={{ height: tableHeight[0] }}>
                    {columns.map((item = {}, index) => (
                      <Th key={index} {...getTdThProp(item)}>
                        {_.isFunction(item.title) ? item.title() : item.title}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
              ) : null}
              <div className={styles._scrollerTableContainer}>
                <div className={styles._scrollerTable}>
                  <Scroller {...scrollerConfig}>
                    {children}
                    <Tbody>
                      {dataSource.map((item = {}, index) => {
                        return (
                          <React.Fragment key={index}>
                            <Tr
                              style={{ height: tableHeight[1] }}
                              className={classNames(
                                index % 2 === 0 ? 'even' : 'odd',
                                activeTrIndex === index ? 'activeTr' : null
                              )}
                              onClick={e => {
                                _.isFunction(onClickRow) && onClickRow(item, e);
                              }}>
                              {columns.map((item2 = {}, index2) => {
                                let result = '';
                                let className;
                                const key = item2.dataIndex;
                                let value = item[key];
                                if (key !== this.action && (_.isNaN(value) || _.isUndefined(value))) {
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
                                    {(item2.width || item2.ellipse || item2.ellipse === 0) && key !== this.action ? (
                                      <div
                                        className={classNames(
                                          _.isNumber(item2.ellipse) ? styles.ellipse : styles.ellipseRight
                                        )}
                                        style={{ marginRight: _.isNumber(item2.ellipse) ? item2.ellipse : null }}>
                                        {result}
                                      </div>
                                    ) : (
                                      result
                                    )}
                                  </Td>
                                );
                              })}
                            </Tr>
                            {expandedRowRender && _.isFunction(expandedRowRender) && item.expandIsOpen
                              ? expandedRowRender(item)
                              : null}
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
                </div>
              </div>
            </Table>
            {totalPage && dataSource.length ? (
              <Pagination
                total={totalPage}
                currentPage={currentPage}
                onPageChange={value => {
                  this.setState(
                    {
                      currentPage: value,
                    },
                    this.getPageData
                  );
                }}
              />
            ) : null}
          </>
        )}
      </div>
    );
  }
}
