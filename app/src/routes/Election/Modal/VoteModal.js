import React from 'react';
import { Button, Input, Mixin, Modal, FormattedMessage } from '../../../components';
import { InputHorizotalList, FreeBalance } from '../../components';
import { PlaceHolder } from '../../../constants';
import { Inject, Patterns, setBlankSpace, classNames } from '../../../utils';
import * as styles from './VoteModal.less';

@Inject(({ electionStore: model, chainStore, assetStore }) => ({ model, chainStore, assetStore }))
class VoteModal extends Mixin {
  constructor(props) {
    super(props);
    this.state = {
      selectNode: '',
      selectNodeErrMsg: '',
      action: 'add',
      amount: '',
      amountErrMsg: '',
      remark: '',
      remarkErrMsg: '',
    };
  }

  startInit = async () => {
    const {
      chainStore: { dispatch },
      electionStore: { dispatch: electionDispatch },
    } = this.props;

    dispatch({ type: 'getBlockPeriod' });
    electionDispatch({ type: 'getBondingDuration' });
    electionDispatch({ type: 'getIntentionBondingDuration' });
  };

  checkAll = {
    checkSelectNode: () => {
      const { selectNode, action } = this.state;
      let errMsg = '';
      if (action === 'switch') {
        errMsg = Patterns.check('required')(selectNode);
      }
      this.setState({ selectNodeErrMsg: errMsg });
      return errMsg;
    },
    checkAmount: () => {
      const { amount, action } = this.state;
      const {
        assetStore: { normalizedAccountNativeAssetFreeBalance: freeShow },
        globalStore: {
          setDefaultPrecision,
          modal: { data: { myTotalVote = 0 } = {} },
        },
      } = this.props;

      let errMsg =
        Patterns.check('required')(amount) ||
        Patterns.check('smaller')(0, amount, <FormattedMessage id={'AmountBiggerThan'} values={{ one: 0 }} />);

      if (!errMsg) {
        if (action === 'add') {
          errMsg = Patterns.check('smallerOrEqual')(amount, freeShow);
        } else if (action === 'cancel' || action === 'switch') {
          errMsg = Patterns.check('smallerOrEqual')(amount, setDefaultPrecision(myTotalVote));
        }
      }
      this.setState({ amountErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkSelectNode', 'checkAmount'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { checkAll } = this;
    const { amount, amountErrMsg, remark, action, selectNode, selectNodeErrMsg } = this.state;
    const {
      model: { dispatch, openModal, setDefaultPrecision, getDefaultPrecision, originIntentions = [] },
      globalStore: {
        modal: { data: { target, myTotalVote = 0, isCurrentAccount, isActive } = {} },
        nativeAssetName: token,
      },
      chainStore: { blockDuration },
      electionStore: { bondingDuration, intentionBondingDuration },
      assetStore: { normalizedAccountNativeAssetFreeBalance: freeShow },
      accountStore: { isValidator },
    } = this.props;

    const bondingSeconds =
      (blockDuration * (isCurrentAccount ? intentionBondingDuration : bondingDuration)) / (1000 * 60 * 60 * 24);

    let operation;
    let operationAmount;
    if (!myTotalVote) {
      operation = <FormattedMessage id={'Nominate'} />;
      operationAmount = <FormattedMessage id={'NominateAmount'} />;
    } else if (action === 'add') {
      operation = <FormattedMessage id={'IncreaseN'} />;
      operationAmount = <FormattedMessage id={'IncreaseAmount'} />;
    } else if (action === 'cancel') {
      operation = <FormattedMessage id={'DecreaseN'} />;
      operationAmount = <FormattedMessage id={'DecreaseAmount'} />;
    } else {
      operation = <FormattedMessage id={'SwitchN'} />;
      operationAmount = <FormattedMessage id={'SwitchAmount'} />;
    }

    const nodesOptions = originIntentions.map((item = {}) => ({
      label: item.name,
      value: item.account,
      isActive: item.isActive,
    }));

    return (
      <Modal
        title={<FormattedMessage id={'Nominate'} />}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                const signModal = () =>
                  openModal({
                    name: 'SignModal',
                    data: {
                      description: [
                        { name: 'operation', value: () => operation },
                        { name: () => operationAmount, value: setBlankSpace(amount, token) },
                        { name: () => <FormattedMessage id={'Memo'} />, value: remark.trim() },
                      ],
                      ...(action === 'add'
                        ? {
                            checkNativeAsset: (accountNativeAssetFreeBalance, fee, minValue) => {
                              if (minValue === 0) {
                                return accountNativeAssetFreeBalance - fee - amount >= minValue;
                              } else {
                                return accountNativeAssetFreeBalance - fee - amount > minValue;
                              }
                            },
                          }
                        : {}),
                      callback: () => {
                        return dispatch({
                          type: action === 'add' ? 'nominate' : action === 'cancel' ? 'unnominate' : 'renominate',
                          payload: {
                            target,
                            amount,
                            remark: remark.trim(),
                            ...(action === 'switch' ? { to: selectNode.value } : {}),
                          },
                        });
                      },
                    },
                  });

                if ((action === 'add' && !isActive) || (action === 'switch' && !selectNode.isActive)) {
                  openModal({
                    name: 'InactiveVoteConfirmModal',
                    data: {
                      callback: signModal,
                    },
                  });
                } else {
                  signModal();
                }
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.voteModal}>
          {myTotalVote ? (
            <>
              <ul className={styles.changeVote}>
                {[
                  { label: <FormattedMessage id={'IncreaseNomination'} />, value: 'add' },
                  {
                    label: <FormattedMessage id={'SwitchNomination'} />,
                    value: 'switch',
                    disabeld: isValidator && isCurrentAccount,
                  },
                  { label: <FormattedMessage id={'DecreaseNomination'} />, value: 'cancel' },
                ]
                  .filter(item => item)
                  .map((item, index) => (
                    <li
                      key={index}
                      className={classNames(
                        action === item.value ? styles.active : null,
                        item.disabeld ? styles.disabeld : null
                      )}
                      onClick={() => {
                        this.setState({ action: item.value, amount: '', amountErrMsg: '' });
                      }}>
                      {item.label}
                    </li>
                  ))}
              </ul>

              <div className={styles.afterchange}>
                <FormattedMessage id={'NominationAmountAfterModified'}>{msg => `${msg}:`}</FormattedMessage>
                {action === 'add' && setDefaultPrecision(myTotalVote + Number(setDefaultPrecision(amount, true)))}
                {(action === 'cancel' || action === 'switch') &&
                  setDefaultPrecision(myTotalVote - Number(setDefaultPrecision(amount, true)))}
              </div>
            </>
          ) : null}

          {action === 'add' && (
            <InputHorizotalList
              className={styles.addvote}
              left={
                <Input.Text
                  errMsgIsOutside
                  precision={getDefaultPrecision()}
                  label={operationAmount}
                  value={amount}
                  errMsg={amountErrMsg}
                  onChange={value => this.setState({ amount: value })}
                  onBlur={checkAll.checkAmount}
                />
              }
              right={<FreeBalance value={freeShow} unit={token} />}
            />
          )}
          {action === 'switch' && (
            <FormattedMessage id={'NodeName'}>
              {msg => (
                <Input.Select
                  label={<FormattedMessage id={'NewNode'} />}
                  errMsg={selectNodeErrMsg}
                  allowCreate={false}
                  value={selectNode}
                  placeholder={msg}
                  options={nodesOptions}
                  onChange={value => {
                    this.setState({
                      selectNode: value,
                    });
                  }}
                  onBlur={checkAll.checkSelectNode}
                />
              )}
            </FormattedMessage>
          )}
          {(action === 'cancel' || action === 'switch') && (
            <Input.Text
              errMsgIsOutside
              precision={getDefaultPrecision()}
              label={operationAmount}
              value={amount}
              errMsg={amountErrMsg}
              onChange={value => this.setState({ amount: value })}
              onBlur={checkAll.checkAmount}
            />
          )}
          <FormattedMessage id={'CharacterLength'} values={{ length: 64 }}>
            {msg => (
              <Input.Text
                trim={false}
                isTextArea
                rows={1}
                label={<FormattedMessage id={'Memo'} />}
                placeholder={msg}
                value={remark}
                onChange={value => this.setState({ remark: value.slice(0, PlaceHolder.getTextAreaLength) })}
              />
            )}
          </FormattedMessage>
          {action === 'cancel' && (
            <div className={styles.lockweek}>
              <FormattedMessage id={'LockTime'} values={{ time: bondingSeconds }} />
            </div>
          )}
        </div>
      </Modal>
    );
  }
}

export default VoteModal;
