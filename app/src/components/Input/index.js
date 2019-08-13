import React, { PureComponent } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/lib/Creatable';
import { Clipboard, Mixin, FormattedMessage } from '../../components';
import { _, classNames, RegEx } from '../../utils';
import * as styles from './index.less';

const renderErrMsg = errMsg => {
  if (errMsg && /^[a-zA-Z]+$/.test(errMsg)) {
    return <FormattedMessage id={errMsg} />;
  } else {
    return errMsg;
  }
};

class InputRadio extends PureComponent {
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

class CheckBox extends PureComponent {
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
          )}>
          <div
            style={style}
            className={classNames(styles.checkbox, value ? styles.active : null)}
            onClick={() => {
              _.isFunction(onClick) && onClick(!value);
            }}>
            {value ? <i className="iconfont icon-dagou1" /> : null}
          </div>
          <span
            className={styles.label}
            onClick={() => {
              _.isFunction(onClick) && onClick(!value);
            }}>
            {label}
            {children}
          </span>
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
      multi = false,
      errMsgIsOutside = false,
      placeholder = <FormattedMessage id={'PleaseSelect'} />,
      allowCreate = true,
      isSearchable = true,
      maxHeight = 150,
    } = this.props;
    const errMsg = errMsgIsOutside ? this.props.errMsg : this.state.errMsg;
    const Ele = allowCreate ? CreatableSelect : Select;
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
            <Ele
              isSearchable={isSearchable}
              placeholder={placeholder}
              isMulti={multi}
              closeMenuOnSelect={!multi}
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
                  maxHeight,
                  overflowY: 'auto',
                }),
              }}
            />
          </div>
        </div>
        {errMsg ? <div className={styles.errMsg}>{renderErrMsg(errMsg)}</div> : null}
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
    const { passwordType } = this.state;
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
      onFocus,
      icon = '',
      disabled = false,
      readonly = false,
      label = '',
      prefix = '',
      suffix = '',
      errMsgSuffix = false,
      shape = 'round',
      placeholder = '',
      rows = 1,
      className,
      isDecimal = false,
      precision,
      errMsgIsOutside = false,
      trim = true,
      helpContent,
    } = this.props;

    const errMsg = errMsgIsOutside ? this.props.errMsg : this.state.errMsg;
    const props = {
      placeholder,
      type: isPassword && passwordType ? 'password' : 'text',
      value: value,
      disabled: disabled,
      readOnly: readonly,
      onChange: e => {
        if (
          (isDecimal === 'decimal' || precision) &&
          !(RegEx.decimalNumber.test(e.target.value) || e.target.value === '')
        ) {
          return;
        }
        if (precision && !(RegEx.checkDecimalNumber(precision).test(e.target.value) || e.target.value === '')) {
          return;
        }
        if (!disabled) {
          if (errMsg !== '') {
            this.changeState({
              errMsg: '',
            });
          }

          _.isFunction(onChange) && onChange(trim ? e.target.value.trim() : e.target.value);
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
      onFocus,
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
            readonly ? styles.disabled : null,
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
            <div className={styles.suffix}>{errMsg && errMsgSuffix ? <span>{renderErrMsg(errMsg)}</span> : suffix}</div>
          ) : null}
        </div>
        {helpContent && <div className={styles.helpContent}>{helpContent}</div>}
        {errMsg && !errMsgSuffix ? <div className={styles.errMsg}>{renderErrMsg(errMsg)}</div> : null}
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

  onChange = event => {
    const { onChange = x => x } = this.props;
    onChange(event.target.value.trim());
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
    const { showDropdown } = this.state;
    const {
      className,
      errMsg = '',
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
    const sortedOptions = options.sort((next1, next2) => {
      if (value) {
        const match1 = new RegExp(value, 'ig').test(next1.label);
        const match2 = new RegExp(value, 'ig').test(next2.label);
        if (match1 || match2) {
          if (match1 && !match2) {
            return -1;
          } else if (!match1 && match2) {
            return 1;
          }
          return 0;
        }
      }

      return 0;
    });

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

            {showDropdown && options.length > 0 ? (
              <div className={styles.dropdown}>
                <div className={styles.dropdownBody}>
                  {sortedOptions.map((option, index) => {
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
            ) : null}
          </div>
        </div>
        {errMsg ? <div className={styles.errMsg}>{renderErrMsg(errMsg)}</div> : null}
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
