import React from 'react';
import CreatableSelect from 'react-select/lib/Creatable';
import { Clipboard } from '../../components';
import { _, classNames } from '../../utils';
import * as styles from './index.less';

class InputRadio extends React.Component {
  render() {
    const {
      className,
      size = 'middle',
      type = 'primary',
      onClick,
      children,
      disabled = false,
      label = '',
      active = false,
    } = this.props;
    return (
      <div className={classNames(styles.inputcontainer, className)}>
        <div
          className={classNames(
            styles.input,
            styles.radioinput,
            styles[size],
            styles[type],
            disabled ? styles.disabled : null
          )}
          onClick={() => {
            _.isFunction(onClick) && onClick();
          }}>
          <div className={classNames(styles.radio, active ? styles.active : null)} />
          <div className={styles.label}>
            {label}
            {children}
          </div>
        </div>
      </div>
    );
  }
}

class CheckBox extends React.Component {
  render() {
    const {
      className,
      size = 'middle',
      type = 'primary',
      onClick,
      children,
      disabled = false,
      label = '',
      value,
    } = this.props;
    return (
      <div className={classNames(styles.inputcontainer, className)}>
        <div
          className={classNames(
            styles.input,
            styles.checkboxinput,
            styles[size],
            styles[type],
            disabled ? styles.disabled : null
          )}
          onClick={() => {
            _.isFunction(onClick) && onClick();
          }}>
          <div className={classNames(styles.checkbox, value ? styles.active : null)}>
            {value ? <i className="iconfont icon-xuanzekuangxuanzhong" /> : null}
          </div>
          <div className={styles.label}>
            {label}
            {children}
          </div>
        </div>
      </div>
    );
  }
}

class InputSelect extends React.Component {
  render() {
    const {
      className,
      size = 'middle',
      type = 'primary',
      value = '',
      onChange,
      errMsg = '',
      disabled = false,
      label = '',
      onInputChange,
      onCreateOption,
      options = [],
      prefix = '',
    } = this.props;
    return (
      <div className={classNames(styles.inputcontainer, className)}>
        {label ? <div className={styles.label}>{label}</div> : null}
        <div
          className={classNames(
            styles.input,
            styles.selectinput,
            styles[size],
            styles[type],
            disabled ? styles.disabled : null
          )}>
          {prefix ? <div className={styles.prefix}>{prefix}</div> : null}
          <div className={styles.userinput}>
            <CreatableSelect
              value={value}
              className={styles.selectContainer}
              isClearable
              onChange={onChange}
              onCreateOption={onCreateOption}
              onInputChange={onInputChange}
              options={options}
              styles={{
                control: () => ({
                  display: 'flex',
                }),
                menuList: () => ({
                  maxHeight: 150,
                  overflowY: 'auto',
                }),
              }}
            />
          </div>
        </div>
        {errMsg ? <div className={styles.errMsg}>{errMsg}</div> : null}
      </div>
    );
  }
}

class InputText extends React.Component {
  state = {
    passwordType: true,
    errMsg: this.props.errMsg,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.errMsg !== this.props.errMsg) {
      this.setState({
        errMsg: this.props.errMsg,
      });
    }
  }

  render() {
    const { passwordType, errMsg } = this.state;
    const {
      children,
      isPassword = false,
      isCopy = false,
      isTextArea = false,
      size = 'middle',
      type = 'primary',
      value = '',
      onChange,
      onBlur,
      icon = '',
      disabled = false,
      label = '',
      prefix = '',
      suffix = '',
      shape = 'round',
    } = this.props;
    const props = {
      type: isPassword && passwordType ? 'password' : 'text',
      value: value,
      disabled: disabled,
      onChange: e => {
        if (!disabled) {
          this.setState({
            errMsg: '',
          });
          _.isFunction(onChange) && onChange(e.target.value);
        }
      },
      onBlur: e => {
        if (!disabled) {
          _.isFunction(onBlur) && onBlur(e.target.value);
        }
      },
    };
    const input = isTextArea ? (
      <textarea {...props} />
    ) : (
      <>
        {isPassword ? <input type="password" name="password" style={{ display: 'none' }} /> : null}
        <input {...props} />
      </>
    );
    return (
      <div className={styles.inputcontainer}>
        {label ? (
          <div className={styles.label}>
            <div>{label}</div>
            <div>{children}</div>
          </div>
        ) : null}
        <div
          className={classNames(
            styles.input,
            styles[shape],
            styles[size],
            styles[type],
            disabled ? styles.disabled : null
          )}>
          {prefix ? <div className={styles.prefix}>{prefix}</div> : null}
          <div className={styles.userinput}>
            {isCopy ? <Clipboard className={styles.clipboard}>{input}</Clipboard> : input}

            {icon || isPassword ? (
              <div
                className={styles.icon}
                onClick={() => {
                  isPassword &&
                    this.setState({
                      passwordType: !passwordType,
                    });
                }}>
                {isPassword ? (
                  <i className={classNames('iconfont', `icon-${passwordType ? 'biyan' : 'yanjing'}`)} />
                ) : (
                  icon || isPassword
                )}
              </div>
            ) : null}
          </div>
          {suffix ? <div className={styles.suffix}>{suffix}</div> : null}
        </div>
        {errMsg ? <div className={styles.errMsg}>{errMsg}</div> : null}
      </div>
    );
  }
}

class InputSelectPending extends React.Component {
  state = {
    expand: false,
  };
  componentDidMount() {
    window.onclick = () => {
      const { expand } = this.state;
      if (expand) {
        this.changeExpand(false);
      }
    };
  }
  changeExpand = status => {
    const { expand } = this.state;
    this.setState({
      expand: _.isUndefined(status) ? !expand : status,
    });
  };
  render() {
    const { expand } = this.state;
    const { changeExpand } = this;
    const { options = [{ lebel: '1', value: 1 }, { lebel: '2', value: 2 }] } = this.props;
    return (
      <div
        className={classNames(styles.select2, expand ? styles.expand : null)}
        onClick={e => {
          changeExpand();
          e.nativeEvent.stopImmediatePropagation();
          return false;
        }}>
        <div>fff</div>
        <ul>
          {options.map(({ label, value }, index) => (
            <li key={index}>label</li>
          ))}
        </ul>
      </div>
    );
  }
}

export default {
  Text: InputText,
  Select: InputSelect,
  Radio: InputRadio,
  Checkbox: CheckBox,
};