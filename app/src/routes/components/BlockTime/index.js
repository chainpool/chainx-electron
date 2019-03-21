import React from 'react';
import { getBlockTime } from '../../../services';
import { moment_helper } from '../../../utils';
import { Mixin } from '../../../components';

class BlockTime extends Mixin {
  constructor(props) {
    super(props);
    this.state = {
      time: props.value,
      timeAfter: '',
    };
  }

  startInit = () => {
    const { value } = this.props;
    getBlockTime({ height: value })
      .then((res = {}) => {
        if (res.time) {
          this.changeState({
            timeAfter: res.time,
          });
        }
      })
      .catch(() => {});
  };

  render() {
    const { time, timeAfter } = this.state;
    return <span>{timeAfter ? moment_helper.formatHMS(timeAfter) : time}</span>;
  }
}

export default BlockTime;
