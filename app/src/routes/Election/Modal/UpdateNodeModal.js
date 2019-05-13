import React, { Component } from 'react';
import { Button, FormattedMessage, Input, Modal } from '../../../components';
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
  };

  componentDidMount() {
    const {
      electionStore: { accountValidator = {} },
    } = this.props;
    this.setState({
      address: accountValidator.sessionAddress,
      website: accountValidator.url,
      about: accountValidator.about,
      willParticipating: accountValidator.isActive,
    });
  }

  checkAll = {
    checkAddress: () => {
      const { address } = this.state;
      const errMsg = Patterns.check('required')(address) || Patterns.check('isChainXAddress')(address);
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
    const { address, addressErrMsg, website, websiteErrMsg, willParticipating, about, aboutErrMsg } = this.state;
    const {
      model: { dispatch, openModal },
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
                      { name: '操作', value: '更新节点' },
                      { name: '出块地址', value: address, toastShow: false },
                      { name: '官网域名', value: website },
                      { name: '参选状态', value: willParticipating ? '参选' : '退选' },
                      { name: '简介', value: about },
                    ],
                    callback: () => {
                      return dispatch({
                        type: 'refresh',
                        payload: {
                          url: website,
                          participating: willParticipating,
                          address,
                          about,
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
          <Input.Text
            prefix="ChainX"
            label={<FormattedMessage id={'BlockAuthoringAddress'} />}
            value={address}
            errMsg={addressErrMsg}
            onChange={value => this.setState({ address: value })}
            onBlur={checkAll.checkAddress}
          />
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
          <div>
            {willParticipating
              ? '请确保您的节点已经部署妥当，否则将会受到惩罚'
              : '退选后无法再接受投票，不会再有奖惩和惩罚'}
          </div>
        </div>
      </Modal>
    );
  }
}

export default UpdateNodeModal;
