import React, { Component } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Inject } from '../../utils';

@Inject(({ globalStore: model }) => ({ model }))
class FormattedMessage extends Component {
  Fragment;
  render() {
    const {
      model: { language },
    } = this.props;

    return (
      <Message key={language} {...this.props} defaultMessage=" ">
        {value => {
          return <>{value} </>;
        }}
      </Message>
    );
  }
}

export default FormattedMessage;
