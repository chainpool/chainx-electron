import React, { Component } from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Inject } from '../../utils';

@Inject(({ globalStore: model }) => ({ model }))
class FormattedMessage extends Component {
  render() {
    const { model: { language } = {}, id, values, children } = this.props;

    return (
      <Message key={language} id={id} values={values} defaultMessage=" ">
        {children
          ? children
          : value => {
              return <>{value}</>;
            }}
      </Message>
    );
  }
}

export default FormattedMessage;
