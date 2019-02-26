import React, { Component } from 'react';

class IncreaseTime extends Component {
  state = {
    time: 0,
  };

  componentDidMount() {
    this.interval = setInterval(() => {
      const { time } = this.state;
      this.setState({
        time: time + 1,
      });
    }, 1);
  }

  componentDidUpdate(prevProps) {
    const { value: value_prev } = prevProps;
    const { value } = this.props;
    if (value !== value_prev) {
      clearInterval(this.interval);
      this.setState({
        time: 0,
      });
    }
  }

  render() {
    const { time } = this.state;
    return <span>{time}</span>;
  }
}

export default IncreaseTime;
