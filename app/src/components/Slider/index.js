import React, { Component } from 'react';
import { default as ReactSlider } from 'rc-slider';
import './index.less';

export default class Slider extends Component {
  render() {
    const {
      min = 0,
      max = 100,
      step = null,
      included = true,
      marks = {},
      onChange,
      defaultValue,
      value = 50,
      style = {},
      disabled,
    } = this.props;
    const [blue, gray] = ['#3da0d2', '#dce0e2'];

    const props = {
      onChange,
      ...(value ? { value } : {}),
      marks,
      defaultValue,
      min,
      max,
      included,
      step,
      disabled,
      dotStyle: {
        // marginLeft: 'unset',
        backgroundColor: gray,
        border: 'none',
        // bottom: '-2px',
      },
      railStyle: {
        height: '4px',
        backgroundColor: gray,
      },
      handleStyle: {
        // marginTop: '-6px',
        marginLeft: '-6px',
        width: '14px',
        height: '14px',
        border: 'none',
        backgroundColor: blue,
      },
      // 后面两个当开启includetrue时有效
      trackStyle: {
        height: '3px',
        backgroundColor: blue,
      },
      activeDotStyle: {
        backgroundColor: blue,
      },
    };
    return (
      <div
        style={{
          width: '100%',
          ...style,
        }}>
        <ReactSlider {...props} />
      </div>
    );
  }
}