import React, { Component } from 'react';
import { Inject } from '@utils';

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
      dispatch({
        type: 'add',
        payload: {
          tag: 'Alice',
          address: '1111',
          encoded: '22222'
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
