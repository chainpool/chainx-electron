import React, { Component } from 'react';

import { Inject } from '../../utils';

@Inject(({ Configure: model }) => ({ model }))
class Configure extends Component {
  render() {
    return <div>ahhahahah</div>;
  }
}

export default Configure;
