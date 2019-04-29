import React, { Component } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Inject } from '../../utils';

@Inject(({ globalStore: model }) => ({ model }))
class FormattedMessage extends Component {
  render() {
    const {
      model: { language },
    } = this.props;
    return <Message key={language} {...this.props} defaultMessage=" " />;
  }
}

export default FormattedMessage;
