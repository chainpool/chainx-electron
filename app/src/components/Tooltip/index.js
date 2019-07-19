import React, { PureComponent } from 'react';
import ReactTooltip from 'react-tooltip';
import { _, classNames } from '../../utils';
import * as styles from './index.less';

export default class Tooltip extends PureComponent {
  state = {
    uid: _.uniqueId('tooltip_'),
  };

  render() {
    const { uid } = this.state;
    const {
      children,
      onClick,
      type = 'hover',
      size = 'middle',
      offset = {},
      place = 'bottom',
      tip = 'tooltip提示',
      className,
      width,
      multiline = true,
    } = this.props;

    function strLength(str) {
      if (str.charCodeAt(0) < 0 || str.charCodeAt(0) > 128) return 2;
      return 1;
    }

    function strsLength(str) {
      if (!_.isString(str)) return str;
      if (str === null || str === undefined) return null;
      let intLength = 0;
      for (let i = 0; i < str.length; i++) {
        intLength = intLength + strLength(str[i]);
      }
      return intLength;
    }

    function fixedLengthFormatString(str, num) {
      if (!_.isString(str)) return str;
      if (str === null || str === undefined) return null;
      if (!/^[0-9]*[1-9][0-9]*$/.test(num)) return null;
      const array = [];
      const len = str.length;
      let start = 0;
      if (strsLength(str) <= num) {
        array.push(str.slice());
      } else {
        for (let i = 0; i <= len; i++) {
          const part = str.slice(start, i);
          const partLength = strsLength(part);
          if (partLength >= num) {
            array.push(part);
            start = i;
          } else if (start === len - 1 || i === len - 1) {
            array.push(str.slice(start));
          }
        }
      }
      return Array.from(new Set(array));
    }

    const multiTip = multiline ? fixedLengthFormatString(tip, 48) : tip;

    return (
      <>
        {type === 'hover' ? (
          <>
            <span data-for={uid} data-tip={tip} className={styles.tip} data-iscapture="true">
              {children}
            </span>
            <ReactTooltip
              effect="solid"
              offset={offset}
              multiline
              id={uid}
              place={place}
              className={classNames(styles.tool, styles[size], className, width ? styles.noMaxWidth : null)}>
              {_.isArray(multiTip)
                ? multiTip.map((item, ins) => (
                    <span key={ins}>
                      {item}
                      <br />
                    </span>
                  ))
                : multiTip}
            </ReactTooltip>
          </>
        ) : (
          <>
            <span id={uid} data-tip={tip} className={styles.tip}>
              <span
                onClick={e => {
                  e.stopPropagation();
                  if (onClick && _.isFunction(onClick)) {
                    onClick(tip => {
                      tip &&
                        this.setState(
                          {
                            tip,
                          },
                          () => {
                            ReactTooltip.show(document.getElementById(uid));
                          }
                        );
                    });
                  } else {
                    ReactTooltip.show(document.getElementById(uid));
                  }
                }}>
                {children}
              </span>
            </span>

            <ReactTooltip
              className={styles.content}
              event="none"
              effect="solid"
              isCapture={true}
              delayShow={150}
              afterShow={() => {
                setTimeout(() => {
                  ReactTooltip.hide(document.getElementById(uid));
                }, 500);
              }}
            />
          </>
        )}
      </>
    );
  }
}
