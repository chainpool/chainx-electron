import React, { Component } from 'react';
import { FormattedMessage as Message } from 'react-intl';

export default class FormattedMessage extends Component {
  render() {
    return <Message {...this.props} defaultMessage=" " />;
  }
}
