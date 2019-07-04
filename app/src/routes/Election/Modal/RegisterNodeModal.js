import React, { Component } from 'react';
import { Button, FormattedMessage, Input, Modal, RouterGo } from '../../../components';
import { Inject, Patterns } from '../../../utils';
import * as styles from './RegisterNodeModal.less';

@Inject(({ accountStore }) => ({ accountStore }))
class RegisterNodeModal extends Component {
  state = {
    address: '',
    addressErrMsg: '',
    name: '',
    nameErrMsg: '',
    website: '',
    websiteErrMsg: '',
    amount: '',
    amountErrMsg: '',
    remark: '',
    haveRead: false,
    haveReadErrMsg: '',
  };
  checkAll = {
    checkName: () => {
      const { name } = this.state;
      const errMsg =
        Patterns.check('required')(name.trim()) ||
        Patterns.check('smallerOrEqual')(
          2,
          name.length,
          <FormattedMessage id={'MinCharacterLength'} values={{ length: 2 }} />
        );
      this.setState({ nameErrMsg: errMsg });
      return errMsg;
    },
    checkRead: () => {
      const { haveRead } = this.state;
      const errMsg = haveRead ? '' : <FormattedMessage id={'NotSelect'} />;
      this.setState({
        haveReadErrMsg: errMsg,
      });
      return errMsg;
    },
    confirm: () => {
      return ['checkName', 'checkRead'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { checkAll } = this;
    const { name, nameErrMsg, haveRead, haveReadErrMsg } = this.state;
    const {
      electionStore: { dispatch, openModal },
    } = this.props;

    return (
      <Modal
        title={<FormattedMessage id={'RegisterNode'} />}
        button={
          <>
            <div className={styles.document}>
              <Input.Checkbox
                className={styles.readbox}
                value={haveRead}
                onClick={value => {
                  this.setState({
                    haveRead: value,
                    haveReadErrMsg: '',
                  });
                }}>
                <FormattedMessage id={'IHaveRead'} />
                <span className={styles.documentLink}>
                  <RouterGo isOutSide go={{ pathname: 'https://github.com/chainx-org/ChainX/wiki/Testnet' }}>
                    <FormattedMessage id={'NodeDeployDocument'} />
                  </RouterGo>
                </span>
                {haveReadErrMsg && <span className={styles.haveReadErrMsg}>{haveReadErrMsg}</span>}
              </Input.Checkbox>
            </div>
            <Button
              size="full"
              type="confirm"
              onClick={() => {
                if (checkAll.confirm()) {
                  openModal({
                    name: 'SignModal',
                    data: {
                      description: [
                        { name: 'operation', value: () => <FormattedMessage id={'RegisterNode'} /> },
                        { name: () => <FormattedMessage id={'Name'} />, value: name.trim() },
                      ],
                      callback: () => {
                        return dispatch({
                          type: 'register',
                          payload: {
                            name: name.trim(),
                          },
                        });
                      },
                    },
                  });
                }
              }}>
              <FormattedMessage id={'Confirm'} />
            </Button>
          </>
        }>
        <div>
          <FormattedMessage id={'CharacterLength'} values={{ length: '2-12' }}>
            {msg => (
              <Input.Text
                trim={false}
                placeholder={msg}
                label={
                  <div>
                    <FormattedMessage id={'Name'} />{' '}
                    <span style={{ color: '#ea754b', marginLeft: 3 }}>
                      {' '}
                      (<FormattedMessage id={'RegisterNodeUnchangeable'} />)
                    </span>
                  </div>
                }
                value={name}
                errMsg={nameErrMsg}
                onChange={value => this.setState({ name: value.slice(0, 12) })}
                onBlur={checkAll.checkName}
              />
            )}
          </FormattedMessage>
        </div>
      </Modal>
    );
  }
}

export default RegisterNodeModal;
