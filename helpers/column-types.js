'use strict';

/**
 * @overview
 *
 * Available google charts column types
 * <https://developers.google.com/chart/glossary#column-type>
 *
 * 1. string
 * 2. number
 * 3. boolean
 * 4. date
 * 5. datetime
 * 6. timeofday
 *
 */

exports.infer = function(data) {
  let type = '';

  if (typeof data === 'string') {
    data = data.trim();
  }

  if (isBoolean(data)) {
    type = 'boolean';

  } else if (isNumber(data)) {
    type = 'number';

  } else if (isTimeOfDay(data)) {
    type = 'timeofday';

  } else if (isDate(data)) {
    type = 'date';

  } else if (isDateTime(data)) {
    type = 'datetime';

  } else {
    type = 'string';
  }

  return type;
};

/**
 * Available values for a boolean type is:
 * true
 * false
 * null
 */
function isBoolean(data) {
  return data === 'true' || data === 'false' || data === true || data === false;
}

/**
 * Available formats for a number type is:
 * 3
 * 3.0
 * 3.14
 * -71
 * -7.2
 * .6
 */
function isNumber(data) {
  return !isNaN(parseFloat(data)) && isFinite(data) && /^[-+]?(\d+|\d+\.\d*|\d*\.\d+)$/.test(data);
}

/**
 * Available formats for a number type is:
 * HH:mm:ss[.SSS]
 */
function isTimeOfDay(data) {
  return /^\d\d:\d\d:\d\d[\.\d]{0,4}$/.test(data);
}

/**
 * Available formats for a number type is:
 * yyyy-MM-dd
 */
function isDate(data) {
  return /^\d\d\d\d-\d\d-\d\d$/.test(data);
}

/**
 * Available formats for a number type is:
 * yyyy-MM-dd HH:mm:ss[.sss]
 */
function isDateTime(data) {
  return /^\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d[\.\d]{0,4}$/.test(data);
}
