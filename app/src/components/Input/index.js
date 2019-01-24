import React from 'react';
import CreatableSelect from 'react-select/lib/Creatable';
import { Clipboard, Mixin } from '../../components';
import { _, classNames, isEmpty, RegEx } from '../../utils';
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
      style,
    } = this.props;
    return (
      <div className={classNames(styles.inputcontainer)}>
        <div
          className={classNames(
            styles.input,
            styles.checkboxinput,
            styles[size],
            styles[type],
            className,
            disabled ? styles.disabled : null
          )}
          onClick={() => {
            _.isFunction(onClick) && onClick();
          }}>
          <div style={style} className={classNames(styles.checkbox, value ? styles.active : null)}>
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
  state = {
    errMsg: this.props.errMsg,
  };

  componentDidUpdate() {
    if (this.state.errMsg === '' && this.props.errMsg && (this.props.value === null || this.props.value === '')) {
      this.setState({
        errMsg: this.props.errMsg,
      });
    }
  }
  render() {
    const { errMsg = '' } = this.state;
    const {
      className,
      size = 'middle',
      type = 'primary',
      onChange,
      onBlur,
      disabled = false,
      label = '',
      value,
      onInputChange,
      onCreateOption,
      options = [],
      getOptionLabel = (item = {}) => item.label,
      getOptionValue = (item = {}) => item.value,
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
              getOptionLabel={getOptionLabel}
              getOptionValue={getOptionValue}
              isClearable={false}
              value={value}
              className={styles.selectContainer}
              onChange={value => {
                this.setState({ errMsg: '' });
                _.isFunction(onChange) && onChange(value);
              }}
              onBlur={onBlur}
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

class InputText extends Mixin {
  state = {
    passwordType: true,
    errMsg: this.props.errMsg,
  };

  componentDidUpdate() {
    // console.log(this.state.errMsg, this.props.errMsg, this.props.value, '==========');
    // if (this.state.errMsg === '' && this.props.errMsg && this.props.value === '') {
    //   this.setState({
    //     errMsg: this.props.errMsg,
    //   });
    // }
    // console.log(this.state.errMsg, '--', prevProps.errMsg, '||', this.props.errMsg, '++', this.props.value, '==');
    // if (prevProps.errMsg !== this.props.errMsg) {
    //   this.setState({
    //     errMsg: this.props.errMsg,
    //   });
    // } else if (this.state.errMsg === '' && this.props.errMsg && this.props.value === '') {
    //   this.setState({
    //     errMsg: this.props.errMsg,
    //   });
    // }

    this.checkStatus();
  }

  checkStatus = (must = false) => {
    if (must === false) {
      if (this.state.errMsg === '' && this.props.errMsg && this.props.value === '') {
        this.changeState({
          errMsg: this.props.errMsg,
        });
      }
    } else {
      this.changeState({
        errMsg: this.props.errMsg,
      });
    }
  };

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
      errMsgSuffix = false,
      shape = 'round',
      placeholder = '',
      rows = 1,
      className,
    } = this.props;
    const props = {
      placeholder,
      type: isPassword && passwordType ? 'password' : 'text',
      value: value,
      disabled: disabled,
      onChange: e => {
        if (type === 'decimal' && !(RegEx.decimalNumber.test(e.target.value) || e.target.value === '')) {
          return;
        }
        if (!disabled) {
          if (errMsg !== '') {
            this.changeState({
              errMsg: '',
            });
          }

          _.isFunction(onChange) && onChange(e.target.value);
        }
      },
      onBlur: e => {
        if (!disabled) {
          _.isFunction(onBlur) && onBlur(e.target.value);
          setTimeout(() => {
            this.checkStatus(true);
          });
        }
      },
    };
    const input = isTextArea ? (
      <textarea {...props} rows={rows} />
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
            isTextArea ? styles.textarea : null,
            disabled ? styles.disabled : null,
            className
          )}>
          {prefix ? <div className={styles.prefix}>{prefix}</div> : null}
          <div className={styles.userinput}>
            {isCopy ? <Clipboard className={styles.clipboard}>{input}</Clipboard> : input}

            {icon || isPassword ? (
              <div
                className={styles.icon}
                onClick={() => {
                  this.setState({
                    passwordType: !passwordType,
                  });
                }}>
                {isPassword ? (
                  <i className={classNames('iconfont', `icon-${passwordType ? 'icon-bukejian' : 'icon-kejian'}`)} />
                ) : (
                  icon || isPassword
                )}
              </div>
            ) : null}
          </div>
          {suffix ? (
            <div className={styles.suffix}>{errMsg && errMsgSuffix ? <span>{errMsg}</span> : suffix}</div>
          ) : null}
        </div>
        {errMsg && !errMsgSuffix ? <div className={styles.errMsg}>{errMsg}</div> : null}
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

class InputAddress extends React.Component {
  state = {
    errMsg: this.props.errMsg,
    showDropdown: false,
    address: '',
  };

  componentDidUpdate() {
    if (this.state.errMsg === '' && this.props.errMsg && (this.props.value === null || this.props.value === '')) {
      this.setState({
        errMsg: this.props.errMsg,
      });
    }
  }

  onChange = event => {
    const { onChange = x => x } = this.props;
    onChange(event.target.value);
  };

  onFocus = event => {
    const { onFocus = x => x } = this.props;
    this.setState(
      {
        showDropdown: true,
      },
      () => {
        onFocus();
      }
    );
  };

  onBlur = event => {
    const { onBlur = x => x } = this.props;
    this.setState(
      {
        showDropdown: false,
      },
      () => {
        onBlur();
      }
    );
  };

  selectLabel = (value, label) => {
    const { onChange = x => x } = this.props;
    onChange(value, label);
  };

  render() {
    const { errMsg = '', showDropdown } = this.state;
    const {
      className,
      size = 'middle',
      type = 'primary',
      disabled = false,
      label = '',
      value,
      options = [],
      getOptionLabel = (item = {}) => item.label,
      getOptionValue = (item = {}) => item.value,
      prefix = '',
      placeholder = '',
    } = this.props;

    const matchOption = options.find(option => getOptionValue(option) === value);

    return (
      <div className={classNames(styles.inputcontainer, styles.inputAddress, className)}>
        {label ? (
          <div className={styles.label}>
            <span>
              {label}
              {matchOption && <span className={styles.labelName}>（{getOptionLabel(matchOption)}）</span>}
            </span>
          </div>
        ) : null}
        <div
          className={classNames(
            styles.input,
            styles.selectinput,
            styles[size],
            styles[type],
            disabled ? styles.disabled : null
          )}>
          {prefix && <div className={styles.prefix}>{prefix}</div>}
          <div className={classNames(styles.userinput, styles.dropdownGroup)}>
            <input
              onBlur={this.onBlur}
              onFocus={this.onFocus}
              type="text"
              placeholder={placeholder}
              value={value}
              disabled={disabled}
              onChange={this.onChange}
            />

            <div className={styles.dropdown} style={{ display: showDropdown ? 'block' : 'none' }}>
              <div className={styles.dropdownBody}>
                {options.length &&
                  options.map((option, index) => {
                    return (
                      <div
                        key={index}
                        className={styles.dropdownItem}
                        onMouseDown={e => this.selectLabel(getOptionValue(option), getOptionLabel(option))}>
                        {getOptionLabel(option)}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
        {errMsg ? <div className={styles.errMsg}>{errMsg}</div> : null}
      </div>
    );
  }
}

export default {
  Text: InputText,
  Select: InputSelect,
  Radio: InputRadio,
  Checkbox: CheckBox,
  Address: InputAddress,
};
