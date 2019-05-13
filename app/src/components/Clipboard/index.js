import React, { PureComponent } from 'react';
import ClipboardJS from 'clipboard';
import { Tooltip, FormattedMessage } from '../index';
import { _, classNames } from '../../utils';
import * as styles from './index.less';

export default class Clipboard extends PureComponent {
  state = {
    uid: this.props.id || _.uniqueId('clipboard_'),
  };

  componentDidMount() {
    const { outInner = '' } = this.props;
    new ClipboardJS(outInner ? '.outerInner' : '.clipboard');
  }

  render() {
    const { uid } = this.state;
    const { children, className, width, outInner = '' } = this.props;
    return (
      <span className={classNames(styles.clipboard, className)}>
        <span id={uid} className={classNames(styles.children, width ? styles.ellipse : null)} style={{ width }}>
          {children}
        </span>
        <FormattedMessage id={'CopySuccessful'}>
          {msg => (
            <Tooltip tip={msg} type="click">
              <i
                className="clipboard iconfont icon-icon-fuzhi"
                data-clipboard-target={`#${uid}`}
                style={{ marginLeft: children ? 8 : null }}
              />
              {outInner ? (
                <span className={classNames('outerInner', styles.outerInner)} data-clipboard-target={`#${uid}`}>
                  {outInner}
                </span>
              ) : null}
            </Tooltip>
          )}
        </FormattedMessage>
      </span>
    );
  }
}
