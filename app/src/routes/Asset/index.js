import React from 'react';
import { Mixin } from '../../components';
import { Inject } from '../../utils';

@Inject(({ assetStore: model }) => ({ model }))
class Asset extends Mixin {
  state = {};

  startInit = () => {};

  render() {
    return <div>资产</div>;
  }
}

export default Asset;
