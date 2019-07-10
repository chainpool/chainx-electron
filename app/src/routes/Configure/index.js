import React from 'react';
import { Button, Input, Icon, Mixin, ButtonGroup, RouterGo, FormattedMessage } from '../../components';
import { TableTitle, ConfirmAndCancelModal } from '../components';
import { Inject } from '../../utils';
import NodeManageTable from './NodeManageTable';
import ApiManageTable from './ApiManageTable';
import OperationApiModal from './Modal/OperationApiModal';
import OperationNodeModal from './Modal/OperationNodeModal';
import * as styles from './index.less';

@Inject(({ configureStore: model }) => ({ model }))
class Configure extends Mixin {
  render() {
    const {
      model: { netWork = [], currentNetWork = {}, dispatch, openModal },
      globalStore: {
        modal: { name },
        language,
        dispatch: dispatchGlobal,
      },
    } = this.props;
    const languages = [{ value: 'zh', label: '中文' }, { value: 'en', label: 'English' }];

    const tableProps = {
      ...this.props,
      widths: [150, 160, 250, 150, 150],
    };
    return (
      <div className={styles.configure}>
        <div className={styles.title}>
          <TableTitle title={<FormattedMessage id={'NetworkSetting'} />} />
        </div>
        <ul>
          <li>
            <div className={styles.language}>
              <span>
                <FormattedMessage id={'SelectNetType'} />
              </span>
              <div>
                <Input.Select
                  value={{ label: currentNetWork.name, value: currentNetWork.value }}
                  getOptionLabel={item => <FormattedMessage id={item.label} />}
                  options={netWork.map(({ name, value }) => ({ label: name, value }))}
                  onChange={({ label: name, value }) => {
                    dispatch({
                      type: 'setCurrentNetWork',
                      payload: { name, value },
                    });

                    window.location.reload();
                  }}
                />
              </div>
            </div>
          </li>
          <li>
            <div className={styles.network}>
              <span>
                <FormattedMessage id={'SelectWalletLanguage'} />
              </span>
              <div>
                <Input.Select
                  value={languages.filter(item => item.value === language)[0]}
                  options={languages}
                  onChange={item => {
                    dispatchGlobal({
                      type: 'switchLanguage',
                      payload: {
                        lang: item.value,
                      },
                    });
                  }}
                />
              </div>
            </div>
          </li>
        </ul>

        <TableTitle title={<FormattedMessage id={'NodeSetting'} />}>
          <ButtonGroup className={styles.settingButton}>
            <Button type="blank">
              <RouterGo isOutSide go={{ pathname: 'https://github.com/chainx-org/ChainX/wiki/Join-ChainX-Mainnet' }}>
                <Icon name="icon-jiedianbushuwendang" />
                <span className={styles.document}>
                  <FormattedMessage id={'SeeNodeDeployDocument'} />
                </span>
              </RouterGo>
            </Button>
            <Button
              type="blank"
              onClick={() => {
                openModal({
                  name: 'OperationNodeModal',
                  data: {
                    action: 'add',
                    callback: ({ action, name, address }) => {
                      dispatch({
                        type: 'updateNodeOrApi',
                        payload: {
                          target: 'Node',
                          action,
                          name,
                          address,
                        },
                      });
                    },
                  },
                });
              }}>
              <Icon name="icon-tianjia" />
              <FormattedMessage id={'AddNode'} />
            </Button>
          </ButtonGroup>
        </TableTitle>
        <NodeManageTable {...tableProps} />

        <TableTitle style={{ marginTop: 32 }} title={<FormattedMessage id={'APISetting'} />}>
          <ButtonGroup className={styles.settingButton}>
            <Button
              type="blank"
              onClick={() => {
                openModal({
                  name: 'OperationApiModal',
                  data: {
                    action: 'add',
                    callback: ({ action, name, address }) => {
                      dispatch({
                        type: 'updateNodeOrApi',
                        payload: {
                          target: 'Api',
                          action,
                          name,
                          address,
                        },
                      });
                    },
                  },
                });
              }}>
              <Icon name="icon-tianjia" />
              <FormattedMessage id={'AddApi'} />
            </Button>
          </ButtonGroup>
        </TableTitle>
        <ApiManageTable {...tableProps} />
        {name === 'OperationNodeModal' ? <OperationNodeModal {...this.props} /> : null}
        {name === 'OperationApiModal' ? <OperationApiModal {...this.props} /> : null}
        {name === 'DeleteNodeModal' ? <ConfirmAndCancelModal {...this.props} /> : null}
        {name === 'DeleteApiModal' ? <ConfirmAndCancelModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Configure;
