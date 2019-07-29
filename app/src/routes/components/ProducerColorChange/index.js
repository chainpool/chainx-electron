import React, { Component } from 'react';
import { classNames, observer } from '../../../utils';
import * as styles from './index.less';

@observer
class ProducerColorChange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0,
      currentNode: this.props.account,
      colorChange: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { currentChainProducer: currentChainProducer_prev } = prevProps;
    const { currentChainProducer, showChange } = this.props;
    const { currentNode, colorChange } = this.state;

    if (showChange && currentChainProducer && currentChainProducer !== currentChainProducer_prev) {
      if (currentChainProducer === currentNode && !colorChange) {
        this.setState({
          colorChange: true,
        });
      } else if (colorChange === true) {
        this.setState({
          colorChange: false,
        });
      }
    }
  }

  render() {
    const { colorChange } = this.state;
    const { className, Ele = 'div', showChange } = this.props;
    return (
      <Ele className={classNames(colorChange && showChange ? styles.colorChange : null, className)}>
        {this.props.children}
      </Ele>
    );
  }
}

export default ProducerColorChange;
