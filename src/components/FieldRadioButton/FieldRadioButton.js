import React from 'react';
import { node, string } from 'prop-types';
import classNames from 'classnames';
import { Field } from 'react-final-form';

import css from './FieldRadioButton.module.css';

const IconRadioButton = props => {
  const { checkedClassName } = props;
  return (
    <div>
      <svg
        className={props.className}
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 16 16"
        fill="none"
      >
        <circle
          className={props.showAsRequired ? css.required : css.notChecked}
          cx="8"
          cy="8"
          r="7.5"
          fill="white"
          stroke="#595858"
        />
        <circle
          className={classNames(
            props.showAsRequired ? css.required : css.notChecked,
            props.showAsRequired ? css.required2 : css.notChecked2
          )}
          cx="8"
          cy="8"
          r="4"
          fill="#E6E6E6"
        />
      </svg>
    </div>
  );
};

IconRadioButton.defaultProps = { className: null };

IconRadioButton.propTypes = { className: string };

const FieldRadioButtonComponent = props => {
  const {
    rootClassName,
    className,
    svgClassName,
    checkedClassName,
    id,
    label,
    showAsRequired,
    ...rest
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const radioButtonProps = {
    id,
    className: css.input,
    component: 'input',
    type: 'radio',
    ...rest,
  };

  return (
    <span className={classes}>
      <Field {...radioButtonProps} />
      <label htmlFor={id} className={css.label}>
        <span className={css.radioButtonWrapper}>
          <IconRadioButton
            className={svgClassName}
            checkedClassName={checkedClassName}
            showAsRequired={showAsRequired}
          />
        </span>
        <span className={css.text}>{label}</span>
      </label>
    </span>
  );
};

FieldRadioButtonComponent.defaultProps = {
  className: null,
  rootClassName: null,
  svgClassName: null,
  checkedClassName: null,
  label: null,
};

FieldRadioButtonComponent.propTypes = {
  className: string,
  rootClassName: string,
  svgClassName: string,
  checkedClassName: string,

  // Id is needed to connect the label with input.
  id: string.isRequired,
  label: node,

  // Name groups several RadioButtones to an array of selected values
  name: string.isRequired,

  // RadioButton needs a value that is passed forward when user checks the RadioButton
  value: string.isRequired,
};

export default FieldRadioButtonComponent;
