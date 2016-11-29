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
 * exceljs <https://github.com/guyonroche/exceljs>
 *
 * # Value Types
 *
 * The following value types are supported.
 *
 * | Enum Name                 | Enum      | Description       | Example Value |
 * | ------------------------- | --------- | ----------------- | ------------- |
 * | Excel.ValueType.Null      | 0         | No value.         | null |
 * | Excel.ValueType.Merge     | 1         | N/A               | N/A |
 * | Excel.ValueType.Number    | 2         | A numerical value | 3.14 |
 * | Excel.ValueType.String    | 3         | A text value      | 'Hello, World!' |
 * | Excel.ValueType.Date      | 4         | A Date value      | new Date()  |
 * | Excel.ValueType.Hyperlink | 5         | A hyperlink       | { text: 'www.mylink.com', hyperlink: 'http://www.mylink.com' } |
 * | Excel.ValueType.Formula   | 6         | A formula         | { formula: 'A1+A2', result: 7 } |
 */

/** @const */
let validators = [{
  type: '',
  validator: isNull,
  toDataTable: convertNullToDataTable,
  toFile: convertNullToFile
}, {
  type: 'boolean',
  validator: isBoolean,
  toDataTable: convertBooleanToDataTable,
  toFile: convertBooleanToFile
}, {
  type: 'number',
  validator: isNumber,
  toDataTable: convertNumberToDataTable,
  toFile: convertNumberToFile
}, {
  type: 'timeofday',
  validator: isTimeOfDay,
  toDataTable: convertTimeOfDayToDataTable,
  toFile: convertTimeOfDayToFile
}, {
  type: 'date',
  validator: isDate,
  toDataTable: convertDateToDataTable,
  toFile: convertDateToFile
}, {
  type: 'datetime',
  validator: isDateTime,
  toDataTable: convertDateTimeToDataTable,
  toFile: convertDateTimeToFile
}, {
  type: 'string',
  validator: defaultValidator,
  toDataTable: convertStringToDataTable,
  toFile: convertStringToFile
}];

/**
 * @method
 * @name infer
 * @description Infer value data type to one of the 6 built-in type.
 * @param {*} value
 * @returns {string}
 */
exports.infer = function(value) {
  let resultType = '';
  let len = validators.length;

  if (typeof value === 'string') {
    value = value.trim();
  }

  for (let i = 0; i < len; i++) {
    if (validators[i].validator(value) && validators[i].type) {
      resultType = validators[i].type;
      break;
    }
  }

  return resultType;
};

/**
 * @method
 * @name convertFileToDataTable
 * @description
 * @param {*} value
 * @returns {*}
 */
exports.convertFileToDataTable = function(value) {
  let resultValue;
  let len = validators.length;

  for (let i = 0; i < len; i++) {
    if (validators[i].validator(value)) {
      resultValue = validators[i].toDataTable(value);
      break;
    }
  }

  return resultValue;
}

exports.convertDataTableToFile = function(value, type) {
  let resultValue;

  if (isNull(value)) return convertNullToFile();

  let len = validators.length;

  for (let i = 0; i < len; i++) {
    if (type === validators[i].type) {
      resultValue = validators[i].toFile(value);
      break;
    }
  }

  return resultValue;
};

/**
 * @function
 * Default validator that always returns true.
 */
function defaultValidator(value) {
  return true;
}

/**
 * @function
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



function isNull(value) {
  return value === null || (value + '').toLowerCase() === 'null';
}

function convertNullToDataTable(value) {
  return null;
}

function convertBooleanToDataTable(value) {
  return (value === 'true' || value === true) ? true : false;
}

function convertNumberToDataTable(value) {
  return parseFloat(value);
}

function convertTimeOfDayToDataTable(value) {
  let result = [];
  let parts = value.split(':');
  let secondsParts = parts[2].split('.');

  result.push(parseInt(parts[0], 10));
  result.push(parseInt(parts[1], 10));
  result.push(parseInt(secondsParts[0], 10));

  if (secondsParts[1]) result.push(parseInt(secondsParts[1], 10));

  return result;
}

function convertDateToDataTable(value) {
  let result;
  let parts = value.split('-');
  let month = parseInt(parts[1], 10) - 1;
  let day = parseInt(parts[2], 10);

  result = 'Date(' + parts[0] + ',' + month + ',' + day + ')';

  return result;
}

function convertDateTimeToDataTable(value) {
  let result;
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

  return result;
}

function convertStringToDataTable(value) {
  return value + '';
}

//
function convertBooleanToFile(value) {
  return (value + '').toLowerCase();
}

function convertNumberToFile(value) {
  return parseFloat(value);
}

function convertTimeOfDayToFile(value) {
  let result;
  let hour = value[0] < 10 ? '0' + value[0] : value[0];
  let min = value[1] < 10 ? '0' + value[1] : value[1];
  let sec = value[2] < 10 ? '0' + value[2] : value[2];
  let milsec = value[3];

  result = hour + ':' + min + ':' + sec;

  if (milsec) result += '.' + milsec;

  return result;
}

function convertDateToFile(value) {
  let result;
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

  return result;
}

function convertDateTimeToFile(value) {
  let result;
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

  return result;
}

function convertStringToFile(value) {
  return value + '';
}

function convertNullToFile() {
  return 'null';
}
