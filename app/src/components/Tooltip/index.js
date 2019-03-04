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
    } = this.props;

    return (
      <>
        {type === 'hover' ? (
          <>
            <span data-for={uid} data-tip={tip} className={styles.tip}>
              {children}
            </span>
            <ReactTooltip
              offset={offset}
              multiline
              id={uid}
              place={place}
              className={classNames(styles.tool, styles[size])}>
              {tip}
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
