import React, { Component } from 'react';
import { FormattedMessage, Icon, Input, Toast } from '../../../../components';
import { Warn } from '../../../components';
import * as styles from './index.less';
import { classNames, observer, parseQueryString, _ } from '../../../../utils';
import { PATH } from '../../../../constants';

@observer
class Node extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
    };
  }

  filterBestNode = nodes => {
    return nodes.filter(item => item.best)[0];
  };

  componentDidUpdate(prevProps) {
    const { nodes: nodesPrev } = prevProps;
    const { nodes } = this.props;
    const bestNode = this.filterBestNode(nodes);
    if (!this.isFirst && !_.isEqual(nodesPrev, nodes) && bestNode && bestNode.syncStatus !== '') {
      if (
        bestNode.syncStatus &&
        ['100.00%', '100%'].indexOf(bestNode.syncStatus) === -1 &&
        bestNode.syncStatus &&
        bestNode.syncStatus !== '--'
      ) {
        this.isFirst = true;
        Toast.warn('', '', {
          position: 'top-left',
          autoClose: 3000,
          closeButton: true,
          newContent: (
            <div className={styles.toast}>
              <div className={styles.title}>
                <FormattedMessage id={'NodeIncompleteSync'} />
              </div>
              <Warn>
                <FormattedMessage id={'NodeIncompleteSyncDesc'} />
              </Warn>
            </div>
          ),
        });
      }
    }
  }

  async componentDidMount() {
    const {
      configureStore: { dispatch },
      history: {
        location: { pathname, search },
      },
    } = this.props;
    const bestNode = parseQueryString(search).bestNode;
    if (pathname !== PATH.configure) {
      dispatch({
        type: 'subscribeNodeOrApi',
        payload: {
          refresh: !bestNode,
          target: 'Node',
        },
      });
      dispatch({
        type: 'subscribeNodeOrApi',
        payload: {
          refresh: !bestNode,
          target: 'Api',
        },
      });
    }
  }

  render() {
    const {
      configureStore: { nodes = [], api = [], autoSwitchBestNode, autoSwitchBestApi, dispatch, getBestNodeAndApi },
    } = this.props;
    const [bestNode = {}, bestApi = {}] = getBestNodeAndApi();

    const getColorFromDelay = delay => {
      if (delay === 'timeOut') {
        return 'red';
      } else if (delay > 300) {
        return 'yellow';
      } else if (delay <= 300) {
        return 'green';
      }
    };
    const nodeList = (
      <ul>
        {[nodes, api].map((one = [], index) => (
          <li key={index}>
            <Icon
              name="icon-xinhao"
              className={classNames(styles.xinhao, getColorFromDelay([bestNode, bestApi][index]['delay']))}
            />
            <span className={styles.apiornodename}>{index ? bestApi.name : bestNode.name}</span>
            <div className={styles.triangle} />
            <div className={classNames(styles.switchNode, index ? styles.switchsecond : styles.switchfirst)}>
              <ul>
                {one.map((item, ins) => (
                  <li
                    className={item.best ? styles.active : null}
                    key={ins}
                    onClick={() => {
                      if (!item.block) {
                        return Toast.warn(<FormattedMessage id={index ? 'ApiNotConnection' : 'NodeNotConnection'} />);
                      }
                      if (item.best) return false;
                      dispatch({
                        type: 'setBestNodeOrApi',
                        payload: {
                          target: index ? 'Api' : 'Node',
                          index: ins,
                        },
                      });
                      dispatch({
                        type: index ? 'updateAutoSwitchBestApi' : 'updateAutoSwitchBestNode',
                        payload: {
                          ...(index ? { autoSwitchBestApi: false } : { autoSwitchBestNode: false }),
                        },
                      });
                    }}>
                    <div className={styles.name}>
                      {item.name === 'ThisMachine' ? <FormattedMessage id={item.name} /> : item.name}
                    </div>
                    {item.delay === 'timeOut' ? (
                      <span className={getColorFromDelay(item.delay)}>
                        <FormattedMessage id={'OverTime'} />
                      </span>
                    ) : (
                      <span className={classNames(styles.time, getColorFromDelay(item.delay))}>{`${
                        item.delay
                      }ms`}</span>
                    )}
                  </li>
                ))}
                {index ? (
                  <li
                    key={'best'}
                    className={classNames(styles.api, styles.header)}
                    onClick={() => {
                      dispatch({
                        type: 'updateAutoSwitchBestApi',
                        payload: {
                          autoSwitchBestApi: !autoSwitchBestApi,
                        },
                      });
                    }}>
                    <Input.Checkbox
                      style={{ width: 14, height: 14 }}
                      className={styles.check}
                      value={autoSwitchBestApi}
                    />
                    <span>
                      <FormattedMessage id={'SwitchBestApiAuto'} />
                    </span>
                  </li>
                ) : (
                  <li
                    key={'best'}
                    className={classNames(styles.api, styles.header)}
                    onClick={() => {
                      dispatch({
                        type: 'updateAutoSwitchBestNode',
                        payload: {
                          autoSwitchBestNode: !autoSwitchBestNode,
                        },
                      });
                    }}>
                    <Input.Checkbox
                      style={{ width: 14, height: 14 }}
                      className={styles.check}
                      value={autoSwitchBestNode}
                    />
                    <span>
                      <FormattedMessage id={'SwitchBestNodeAuto'} />
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    );

    return <div className={styles.node}>{nodeList}</div>;
  }
}

export default Node;
