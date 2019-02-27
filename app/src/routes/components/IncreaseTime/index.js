import React, { Component } from 'react';
import { Mixin } from '../../../components';

class IncreaseTime extends Mixin {
  state = {
    time: 0,
  };

  startInit = () => {
    this.setTimer();
  };

  setTimer = () => {
    clearInterval(this.interval);
    this.interval = null;
    this.interval = setInterval(() => {
      const { time } = this.state;
      this.changeState({
        time: time + 100,
      });
    }, 100);
  };

  componentDidUpdate(prevProps) {
    const { value: value_prev } = prevProps;
    const { value } = this.props;
    if (value !== value_prev) {
      this.changeState(
        {
          time: 0,
        },
        () => {
          this.setTimer();
        }
      );
    }
  }

  render() {
    const { time } = this.state;
    return <span>{time}/ms</span>;
  }
}

export default IncreaseTime;
