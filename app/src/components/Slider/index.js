import React, { Component } from 'react';
import { default as ReactSlider } from 'slider-perfect';
import 'slider-perfect/assets/index.css';
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
      value = 0,
      style = {},
      disabled,
    } = this.props;
    const [blue, gray] = ['#f6c94a', '#dce0e2'];

    /*解决slider组件marks相同值keys warning问题*/
    const keys = Object.keys(marks);
    keys.forEach((item, index) => {
      const ins = keys.map(item2 => String(parseFloat(item2))).indexOf(String(parseFloat(item)));
      if (ins > -1 && ins !== index && index > 0) {
        delete marks[item];
      }
    });

    const props = {
      onChange,
      value,
      //...(value ? { value } : { value: 0 }),
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
        bottom: '-1px',
      },
      railStyle: {
        height: '2px',
        backgroundColor: gray,
      },
      handleStyle: {
        marginTop: '-6px',
        marginLeft: '-6px',
        // marginTop: '1px',
        width: '14px',
        height: '14px',
        border: '2px solid #f6c94a',
        backgroundColor: 'white',
      },
      // 后面两个当开启includetrue时有效
      trackStyle: {
        height: '2px',
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
