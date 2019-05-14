import React, { Component } from 'react';
import { Inject } from '../../utils';

@Inject(({ globalStore: model }) => ({ model }))
class LanguageContent extends Component {
  render() {
    const { model: { language } = {}, zh, en } = this.props;

    return language === 'zh' ? zh : en;
  }
}

export default LanguageContent;
