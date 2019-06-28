import React, { Component } from 'react';
import { Button, Input, FormattedMessage, Modal } from '../../../components';
import * as styles from './AnalyzeSpecialTradeModal.less';
import { Patterns } from '../../../utils';

class AnalyzeSpecialTradeModal extends Component {
  state = {
    redeemScriptSpecial: '',
    redeemScriptSpecialErrMsg: '',
    tx:
      '010000000483ce097a0d9a3a06258710e9a1f9a2003db9d54e577c0fd9b50ee75be750f6a502000000fdf40100473044022028419ed8472c37c555f4de203c856cc13e2a15431387af3f242b8076eb987610022023b0f59d3faf07c2f34a00ddf81593505ba3527dfaa74fb351fe48ebd45f0abb01483045022100c040a7b9f07ad8c42b401996efb7b0558edc1f7ede8428f05a6c6c83e0e9334702201fbbea6a3ae7b8947480ea1e5dd736137a4ac21a20120e3ebb0280577ab3df7101483045022100fd5046a6cf57408782eab4103bf3e80347438a1a95ade7b058ac10be18c8d7ec02202c41856e30fbd28bd64857742020b7efd1645923f367b6c6417460a3112bacef0147304402206373f683bd19f34de99b1699322868a78cdcb310315df2ae79caaea82696635502204198be5a8cbc306ba0ab2c931ffd42acf00ab431724240ad010f8488602cb076014ccf5421029075b3ff5b6d80dee7a3d6cbc22fa9dfe34fff39352066f6a0d0de0b52d1963a21035b8fb240f808f4d3d0d024fdf3b185b942e984bba81b6812b8610f66d59f3a842102269eae1cd62677f88aadec291b3238e59d216bd8d5df2f2079cb85d5bdc311f22102b9aba17acdda4b4e569587e90804ca80e5751465d6ca623dc716d181d86ffc8321029cb28308147181ffd3f85c1e6a64337472adf6f705b923bf07ac32ae00783b48210306117a360e5dbe10e1938a047949c25a86c0b0e08a0a7c1e611b97de6b2917dd56aeffffffffc4ef3dbf59c8c756c92a1feea44ba0f006ed157aa4dd164d125aacf464c2dcc800000000fdf40100473044022055fa4b5514039cb47ec60b1f241acecfdbc2d1090db11798a417d370fe12ff150220209dbd5d3ed9265b87b3a3700133a1bc8d45006685e06c822203f78050f8683a01483045022100cac3fb9cc0228246182e4e01a122cd38d211a379258bb2ee330b710094f2ce5c0220453ac1397f40ae0be0e9a1bb95b1ed7f21eefe5c4fb74285964c996b22ebb28501483045022100f2e4b83b0aa8265a147ebcf530f127d1c289e9577051724f901d908442036952022020c54e1a33864e0868cf6c630393b542d367fe17aca6519ac3325b24d7bbd170014730440220090adfaa6f708033c44f4b6c502303fb267eaf35cc9b481066d8c9257a5c8276022059a66107998a691b34eb9be7bd47ef42b87ebcb32dd1f2066f286bfe63f312cb014ccf5421029075b3ff5b6d80dee7a3d6cbc22fa9dfe34fff39352066f6a0d0de0b52d1963a21035b8fb240f808f4d3d0d024fdf3b185b942e984bba81b6812b8610f66d59f3a842102269eae1cd62677f88aadec291b3238e59d216bd8d5df2f2079cb85d5bdc311f22102b9aba17acdda4b4e569587e90804ca80e5751465d6ca623dc716d181d86ffc8321029cb28308147181ffd3f85c1e6a64337472adf6f705b923bf07ac32ae00783b48210306117a360e5dbe10e1938a047949c25a86c0b0e08a0a7c1e611b97de6b2917dd56aefffffffff374c2afb5afb46cb20f01574c41543f1d59e70eeb0c8ef113f5aad748bfc95200000000fdf30100473044022053e585865f5fc1f975ef8493ba5a0fdccc5696834b2ad4080a7295f2396f7e7b022070a95221bbaea160da28312248c98d56ba74d2f0aca448e770c80a6bbbf80050014830450221009a2e7fccc9e0def0470fe1e243b8a1bada54023b556e9843f5dea1cc61dd56780220431f1911fa0ee9c91c09670d9db6e5e5f8f84032b7f512dae1415fb51340357c0147304402207ebd63742738837ce5b6719b9c5ceadbc76bf5d5c3e312b63cd2b60f82d8bc95022072a10cf01b2bac61fdd7f81f625519d29cf72ba879f80371523e99ada60755b90147304402201ae1138db533a6bb0c461e3847662a80b950ac581fd6d3bc91d52d54a7e51510022004088b350020ef2ef4c3db7cd6ea83c8147b79c894ad8788aac4f22f565b880a014ccf5421029075b3ff5b6d80dee7a3d6cbc22fa9dfe34fff39352066f6a0d0de0b52d1963a21035b8fb240f808f4d3d0d024fdf3b185b942e984bba81b6812b8610f66d59f3a842102269eae1cd62677f88aadec291b3238e59d216bd8d5df2f2079cb85d5bdc311f22102b9aba17acdda4b4e569587e90804ca80e5751465d6ca623dc716d181d86ffc8321029cb28308147181ffd3f85c1e6a64337472adf6f705b923bf07ac32ae00783b48210306117a360e5dbe10e1938a047949c25a86c0b0e08a0a7c1e611b97de6b2917dd56aeffffffffe7274c4b9d9d7b1de3977818c810bbfade4d1697ba81e304d31ebdb42cd7260a00000000fdf4010048304502210089d7bd08187341803468ca1cfc629279795031e6cc89b86b3b0ebdb616ecdab002201e3dce58302ed1eb87c8b5e86e8cf9753d9b2616a8f7bdf313f2adf296ea134f0147304402203ef4ced665157cb91913d05ef92b40591a8442a4049f777f422e26c01d1668ed02204c0b98fb7535c3af2c58cae3bcb1f9f4e5226eacf614ddccd9c6840cf36a808e014730440220189ead3b8a87202b939b12cac65404750a94db07291d76e9ac636e412d78ddb402203ccca611813bce0af8feb0b55372458bcdf973bc5cb51ae752f5caa5ca77db6c01483045022100b029581787eae7464ad7a2f4f3dfd37046e9aba6e5509104108347604cfe513002200691bf06d07ee5edc6be84bfb864eb4da8e19d80fc96e1b7ac2ae3be500c16d6014ccf5421029075b3ff5b6d80dee7a3d6cbc22fa9dfe34fff39352066f6a0d0de0b52d1963a21035b8fb240f808f4d3d0d024fdf3b185b942e984bba81b6812b8610f66d59f3a842102269eae1cd62677f88aadec291b3238e59d216bd8d5df2f2079cb85d5bdc311f22102b9aba17acdda4b4e569587e90804ca80e5751465d6ca623dc716d181d86ffc8321029cb28308147181ffd3f85c1e6a64337472adf6f705b923bf07ac32ae00783b48210306117a360e5dbe10e1938a047949c25a86c0b0e08a0a7c1e611b97de6b2917dd56aeffffffff01b88fe4000000000017a914a9ae3abbd565a87a9490b56fb61210e7093a6f858700000000',
    txErrMsg: '',
  };
  checkAll = {
    checkRedeemScriptSpecial: () => {
      const { tx, redeemScriptSpecial } = this.state;
      const {
        model: { isTestBitCoinNetWork },
      } = this.props;
      let errMsg = Patterns.check('isTransactionTxSigned')(tx, isTestBitCoinNetWork(), '请输入赎回脚本');
      if (errMsg && redeemScriptSpecial) {
        errMsg =
          Patterns.check('required')(redeemScriptSpecial) || Patterns.check('isRedeemScript')(redeemScriptSpecial);
      }
      this.setState({ redeemScriptSpecialErrMsg: errMsg });
      return errMsg;
    },
    checkTx: () => {
      const { tx } = this.state;
      const {
        model: { isTestBitCoinNetWork },
      } = this.props;
      const errMsg = Patterns.check('required')(tx) || Patterns.check('isTransactionTx')(tx, isTestBitCoinNetWork());
      this.setState({ txErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkTx', 'checkRedeemScriptSpecial'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { tx, txErrMsg, redeemScriptSpecial, redeemScriptSpecialErrMsg } = this.state;
    const {
      model: { dispatch, closeModal },
    } = this.props;

    return (
      <Modal
        title={'解析特殊交易'}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (this.checkAll.confirm()) {
                dispatch({
                  type: 'getInputsAndOutputsFromTx',
                  payload: {
                    tx,
                    isSpecialModel: true,
                  },
                });
                dispatch({
                  type: 'updateRedeemScriptSpecial',
                  payload: {
                    redeemScriptSpecial,
                  },
                });
                closeModal();
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.AnalyzeSpecialTradeModal}>
          <Input.Text
            errMsgIsOutside
            errMsg={txErrMsg}
            label="待签原文"
            isTextArea
            rows={10}
            value={tx}
            onChange={value =>
              this.setState({
                tx: value,
              })
            }
            onBlur={this.checkAll.checkTx}
          />
          {redeemScriptSpecialErrMsg || redeemScriptSpecial ? (
            <Input.Text
              errMsgIsOutside
              errMsg={redeemScriptSpecialErrMsg}
              label="赎回脚本"
              isTextArea
              rows={5}
              value={redeemScriptSpecial}
              onChange={value =>
                this.setState({
                  redeemScriptSpecial: value,
                })
              }
              onBlur={this.checkAll.checkRedeemScriptSpecial}
            />
          ) : null}
        </div>
      </Modal>
    );
  }
}

export default AnalyzeSpecialTradeModal;
