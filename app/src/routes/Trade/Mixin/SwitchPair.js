import React from 'react';
import { Mixin } from '../../../components';

class SwitchPair extends Mixin {
  constructor(props) {
    super(props);
  }

  async componentDidMount(p) {
    super.componentDidMount();
    console.log('haha');
    // super.componentDidUpdate(prevProps);
  }
}

export default SwitchPair;
