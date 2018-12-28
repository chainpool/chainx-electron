import React, { Component } from 'react';
import { Inject } from '@utils';
import { default as ChainxAccount } from '@chainx/account'

@Inject(({ accountStore: model }) => ({ model }))
class Account extends Component {
  componentDidMount() {
    const {
      model: {
        accounts,
        dispatch
      }
    } = this.props

    if (accounts.length <= 0) {
      const tag = 'Alice';
      const passphrase = '123456';
      const account = ChainxAccount.fromText(tag);
      const json = account.keyPair.toJson(passphrase);

      dispatch({
        type: 'add',
        payload: {
          tag,
          address: account.address,
          encoded: json
        }
      })
    }
  }

  render() {
    const { model: { currentAccount, } } = this.props

    return (
      <span>{currentAccount && currentAccount.tag || 'None'}</span>
    );
  }
}

export default Account;
