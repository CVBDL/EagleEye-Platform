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

exports.infer = function(value) {
  let type = '';

  if (typeof value === 'string') {
    value = value.trim();
  }

  if (isBoolean(value)) {
    type = 'boolean';

  } else if (isNumber(value)) {
    type = 'number';

  } else if (isTimeOfDay(value)) {
    type = 'timeofday';

  } else if (isDate(value)) {
    type = 'date';

  } else if (isDateTime(value)) {
    type = 'datetime';

  } else {
    type = 'string';
  }

  return type;
};

exports.convertFileToDataTable = function(value) {
  let result;

  if (isTimeOfDay(value)) {
    let parts = value.split(':');
    let secondsParts = parts[2].split('.');

    result = [];
    result.push(parseInt(parts[0], 10));
    result.push(parseInt(parts[1], 10));
    result.push(parseInt(secondsParts[0], 10));

    if (secondsParts[1]) result.push(parseInt(secondsParts[1], 10));

  } else if (isDate(value)) {
    let parts = value.split('-');
    let month = parseInt(parts[1], 10) - 1;
    let day = parseInt(parts[2], 10);

    result = 'Date(' + parts[0] + ',' + month + ',' + day + ')';

  } else if (isDateTime(value)) {
    let parts = value.split(' ');
    let date = parts[0];
    let time = parts[1];

    let dateParts = date.split('-');
    let month = parseInt(dateParts[1], 10) - 1;
    let day = parseInt(dateParts[2], 10);

    let timeParts = time.split(':');
    let secondsParts = timeParts[2].split('.');

    result = [];
    result.push(parseInt(timeParts[0], 10));
    result.push(parseInt(timeParts[1], 10));
    result.push(parseInt(secondsParts[0], 10));

    if (secondsParts[1]) parseInt(secondsParts[1], 10);

    result = 'Date(' + dateParts[0] + ',' + month + ',' + day + ',' +
      parseInt(timeParts[0], 10) + ',' + parseInt(timeParts[1], 10) + ',' +
      parseInt(secondsParts[0], 10) + (secondsParts[1] ? (',' + parseInt(secondsParts[1], 10)) : '') +')';

  } else {
    result = value;
  }

  return result;
}

exports.convertDataTableToFile = function(value, type) {
  let result;

  if (type === 'timeofday') {
    let hour = value[0] < 10 ? '0' + value[0] : value[0];
    let min = value[1] < 10 ? '0' + value[1] : value[1];
    let sec = value[2] < 10 ? '0' + value[2] : value[2];
    let milsec = value[3];

    result = hour + ':' + min + ':' + sec;

    if (milsec) result += '.' + milsec;

  } else if (type === 'date') {
    let str = value.substring(5, value.length - 1);
    let dateParts = str.split(',');
    let year = dateParts[0];
    let month = parseInt(dateParts[1], 10) + 1;
    let day = parseInt(dateParts[2], 10);
    result = [
      year,
      month < 10 ? '0' + month : month,
      day < 10 ? '0' + day : day
    ].join('-');

  } else if (type === 'datetime') {
    //'Date(1999,0,1,12,0,0,123)'
    let str = value.substring(5, value.length - 1);
    let parts = str.split(',');
    let year = parts[0];
    let month = parseInt(parts[1], 10) + 1;
    let day = parseInt(parts[2], 10);
    let hour = parseInt(parts[3], 10);
    let min = parseInt(parts[4], 10);
    let sec = parseInt(parts[5], 10);
    let milsec = parts[6] ? parseInt(parts[6], 10) : 0;

    let dateArr = [
      year,
      month < 10 ? '0' + month : month,
      day < 10 ? '0' + day : day
    ];
    let timeArr = [
      hour < 10 ? '0' + hour : hour,
      min < 10 ? '0' + min : min,
      sec < 10 ? '0' + sec : sec
    ];

    result = dateArr.join('-') + ' ' + timeArr.join(':');

    if (milsec) result += '.' + milsec;

  } else {
    result = value;
  }

  return result;
};

/**
 * Available values for a boolean type is:
 * true
 * false
 * null
 */
function isBoolean(value) {
  return value === 'true' || value === 'false' || value === true || value === false;
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
function isNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value) && /^[-+]?(\d+|\d+\.\d*|\d*\.\d+)$/.test(value);
}

/**
 * Available formats for a number type is:
 * HH:mm:ss[.SSS]
 */
function isTimeOfDay(value) {
  return /^\d\d:\d\d:\d\d[\.\d]{0,4}$/.test(value);
}

/**
 * Available formats for a number type is:
 * yyyy-MM-dd
 */
function isDate(value) {
  return /^\d\d\d\d-\d\d-\d\d$/.test(value);
}

/**
 * Available formats for a number type is:
 * yyyy-MM-dd HH:mm:ss[.sss]
 */
function isDateTime(value) {
  return /^\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d[\.\d]{0,4}$/.test(value);
}
