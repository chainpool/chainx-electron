import React, { Component } from 'react';
import { Button, FormattedMessage, Icon, Input, Modal, RouterGo } from '../../../components';
import { Inject, Patterns } from '../../../utils';
import * as styles from './UpdateNodeModal.less';

@Inject(({ electionStore, accountStore }) => ({ electionStore, accountStore }))
class UpdateNodeModal extends Component {
  state = {
    address: '',
    addressErrMsg: '',
    website: '',
    websiteErrMsg: '',
    willParticipating: true,
    about: '',
    aboutErrMsg: '',
    blockInfo: {},
  };

  componentDidMount() {
    const {
      electionStore: { accountValidator = {}, dispatch },
    } = this.props;
    this.setState({
      address: accountValidator.sessionAddress,
      website: accountValidator.url,
      about: accountValidator.about,
      willParticipating: accountValidator.isActive,
    });

    dispatch({
      type: 'getIntentionsByAccount',
    }).then(res => {
      this.setState({
        blockInfo: res,
      });
    });
  }

  checkAll = {
    checkAddress: () => {
      const { address } = this.state;
      let errMsg = Patterns.check('required')(address);
      if (!errMsg) {
        const checkAddress =
          Patterns.check('isChainXAddress')(address) && Patterns.check('isChainXAccountPubkey')(address);
        errMsg = checkAddress;
      }
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },

    checkWebsite: () => {
      const { website } = this.state;
      const errMsg = Patterns.check('smallerOrEqual')(
        4,
        website.length,
        <FormattedMessage id={'MinCharacterLength'} values={{ length: 4 }} />
      );
      this.setState({ websiteErrMsg: errMsg });
      return errMsg;
    },

    checkAbout: () => {
      const errMsg = '';
      this.setState({ aboutErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkAddress', 'checkWebsite'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { checkAll } = this;
    const {
      address,
      addressErrMsg,
      website,
      websiteErrMsg,
      willParticipating,
      about,
      aboutErrMsg,
      blockInfo = {},
    } = this.state;
    const {
      model: { dispatch, openModal, encodeAddressAccountId },
      electionStore: { accountValidator: { sessionAddress } = {} },
    } = this.props;

    return (
      <Modal
        title={<FormattedMessage id={'UpdateNode'} />}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                openModal({
                  name: 'SignModal',
                  data: {
                    description: [
                      { name: 'operation', value: () => <FormattedMessage id={'UpdateNode'} /> },
                      {
                        name: () => (
                          <FormattedMessage
                            id={
                              !Patterns.check('isChainXAddress')(address)
                                ? 'BlockAuthoringAddress'
                                : 'BlockAuthoringPubkey'
                            }
                          />
                        ),
                        value: address,
                        toastShow: false,
                      },
                      { name: () => <FormattedMessage id={'Website'} />, value: website },
                      {
                        name: () => <FormattedMessage id={'ParticipateStatus'} />,
                        value: () => <FormattedMessage id={willParticipating ? 'Participate' : 'Elect'} />,
                      },
                      { name: () => <FormattedMessage id={'BriefIntroduction'} />, value: about.trim() },
                    ],
                    callback: () => {
                      const addressTrans = !Patterns.check('isChainXAddress')(address)
                        ? address
                        : encodeAddressAccountId(address);
                      return dispatch({
                        type: 'refresh',
                        payload: {
                          url: website,
                          participating: willParticipating,
                          address: addressTrans === sessionAddress ? null : addressTrans,
                          about: about.trim(),
                        },
                      });
                    },
                  },
                });
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.updateNodeModal}>
          <ul className={styles.intentionsInfo}>
            <li>
              <span>当前出块公钥:</span>
              {blockInfo.sessionKey}
            </li>
            <li>
              <span>当前出块地址:</span>
              {blockInfo.sessionKeyAddress}
            </li>
            <li>
              <span>当前奖池地址:</span>
              {blockInfo.jackpotAddress}
            </li>
          </ul>
          <Input.Text
            prefix="ChainX"
            label={
              <>
                <FormattedMessage id={'BlockAuthoringAddressPubkey'} />
              </>
            }
            value={address}
            errMsg={addressErrMsg}
            onChange={value => this.setState({ address: value })}
            onBlur={checkAll.checkAddress}>
            <Button type="blank">
              <RouterGo isOutSide go={{ pathname: 'https://github.com/chainx-org/ChainX/wiki/Testnet' }}>
                <Icon name="icon-jiedianbushuwendang" />
                <span className={styles.document}>
                  <FormattedMessage id={'SeeNodeDeployDocument'} />
                </span>
              </RouterGo>
            </Button>
          </Input.Text>
          <FormattedMessage id={'CharacterLength'} values={{ length: '4-24' }}>
            {msg => (
              <Input.Text
                label={<FormattedMessage id={'Website'} />}
                placeholder={msg}
                value={website}
                errMsg={websiteErrMsg}
                onChange={value => {
                  if (/^[a-zA-Z0-9.]*$/.test(value)) {
                    this.setState({ website: value.slice(0, 24) });
                  }
                }}
                onBlur={checkAll.checkWebsite}
              />
            )}
          </FormattedMessage>
          <FormattedMessage id={'CharacterLength'} values={{ length: 128 }}>
            {msg => (
              <Input.Text
                trim={false}
                label={<FormattedMessage id={'BriefIntroduction'} />}
                placeholder={msg}
                value={about}
                errMsg={aboutErrMsg}
                onChange={value => this.setState({ about: value.slice(0, 128) })}
                onBlur={checkAll.checkAbout}
              />
            )}
          </FormattedMessage>

          <div className={styles.participate}>
            {[
              { name: <FormattedMessage id="Participate" />, value: true },
              { name: <FormattedMessage id={'Elect'} />, value: false },
            ].map((item, index) => (
              <Button
                key={index}
                className={willParticipating === item.value ? styles.active : null}
                onClick={() => {
                  this.setState({
                    willParticipating: item.value,
                  });
                }}>
                {item.name}
              </Button>
            ))}
          </div>
          <div className={styles.desc}>
            {willParticipating ? (
              <FormattedMessage id={'MakeSureNodesDeployed'} />
            ) : (
              <FormattedMessage id={'NoRewardsAfterWithdrawal'} />
            )}
          </div>
        </div>
      </Modal>
    );
  }
}

export default UpdateNodeModal;
