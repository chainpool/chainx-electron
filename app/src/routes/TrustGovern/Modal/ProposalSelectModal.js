import React, { Component } from 'react';
import { Button, FormattedMessage, Icon, Modal } from '../../../components';
import * as styles from './ProposalSelectModal.less';
import { classNames } from '../../../utils';

class ProposalSelectModal extends Component {
  state = {
    selectOne: 'switch',
  };

  render() {
    const { selectOne } = this.state;
    const {
      model: { openModal, closeModal },
    } = this.props;

    return (
      <Modal
        style={{ width: 360 }}
        title={<div>发起提议</div>}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              openModal({
                name: 'SelectNodeModal',
              });
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.ProposalSelectModal}>
          <ul>
            {[
              { name: 'switch', desc: '信托换届' },
              { name: '手续费调整', desc: '手续费调整' },
              { name: '移除未认领', desc: '移除未认领' },
              { name: '撤销用户提现', desc: '撤销用户提现' },
            ].map((item, index) => (
              <li
                className={classNames(
                  selectOne === item.name || selectOne === item.desc ? styles.active : null,
                  item.disabeld ? styles.disabeld : null
                )}
                key={index}
                onClick={() => {
                  this.setState({
                    selectOne: item.name,
                  });
                }}>
                {item.icon && <Icon name={item.icon} />}
                <span>{item.desc || item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    );
  }
}

export default ProposalSelectModal;
