import { DateView, FieldValueType, MuiPickersAdapter } from '../../models';
import { DateOrTimeViewWithMeridiem } from '../models';

interface FindClosestDateParams<TDate> {
  date: TDate;
  disableFuture?: boolean;
  disablePast?: boolean;
  maxDate: TDate;
  minDate: TDate;
  isDateDisabled: (date: TDate) => boolean;
  utils: MuiPickersAdapter<TDate>;
}

export const findClosestEnabledDate = <TDate>({
  date,
  disableFuture,
  disablePast,
  maxDate,
  minDate,
  isDateDisabled,
  utils,
}: FindClosestDateParams<TDate>) => {
  const today = utils.startOfDay(utils.date()!);

  if (disablePast && utils.isBefore(minDate!, today)) {
    minDate = today;
  }

  if (disableFuture && utils.isAfter(maxDate, today)) {
    maxDate = today;
  }

  let forward: TDate | null = date;
  let backward: TDate | null = date;
  if (utils.isBefore(date, minDate)) {
    forward = minDate;
    backward = null;
  }

  if (utils.isAfter(date, maxDate)) {
    if (backward) {
      backward = maxDate;
    }

    forward = null;
  }

  while (forward || backward) {
    if (forward && utils.isAfter(forward, maxDate)) {
      forward = null;
    }
    if (backward && utils.isBefore(backward, minDate)) {
      backward = null;
    }

    if (forward) {
      if (!isDateDisabled(forward)) {
        return forward;
      }
      forward = utils.addDays(forward, 1);
    }

    if (backward) {
      if (!isDateDisabled(backward)) {
        return backward;
      }
      backward = utils.addDays(backward, -1);
    }
  }

  return null;
};

export const clamp = <TDate>(
  utils: MuiPickersAdapter<TDate>,
  value: TDate,
  minDate: TDate,
  maxDate: TDate,
): TDate => {
  if (utils.isBefore(value, minDate)) {
    return minDate;
  }
  if (utils.isAfter(value, maxDate)) {
    return maxDate;
  }
  return value;
};

export const replaceInvalidDateByNull = <TDate>(
  utils: MuiPickersAdapter<TDate>,
  value: TDate | null,
) => (value == null || !utils.isValid(value) ? null : value);

export const applyDefaultDate = <TDate>(
  utils: MuiPickersAdapter<TDate>,
  value: TDate | null | undefined,
  defaultValue: TDate,
): TDate => {
  if (value == null || !utils.isValid(value)) {
    return defaultValue;
  }

  return value;
};

export const areDatesEqual = <TDate>(utils: MuiPickersAdapter<TDate>, a: TDate, b: TDate) => {
  if (!utils.isValid(a) && a != null && !utils.isValid(b) && b != null) {
    return true;
  }

  return utils.isEqual(a, b);
};

export const getMonthsInYear = <TDate>(utils: MuiPickersAdapter<TDate>, year: TDate) => {
  const firstMonth = utils.startOfYear(year);
  const months = [firstMonth];

  while (months.length < 12) {
    const prevMonth = months[months.length - 1];
    months.push(utils.addMonths(prevMonth, 1));
  }

  return months;
};

export const mergeDateAndTime = <TDate>(
  utils: MuiPickersAdapter<TDate>,
  dateParam: TDate,
  timeParam: TDate,
) => {
  let mergedDate = dateParam;
  mergedDate = utils.setHours(mergedDate, utils.getHours(timeParam));
  mergedDate = utils.setMinutes(mergedDate, utils.getMinutes(timeParam));
  mergedDate = utils.setSeconds(mergedDate, utils.getSeconds(timeParam));

  return mergedDate;
};

export const getTodayDate = <TDate>(utils: MuiPickersAdapter<TDate>, valueType: FieldValueType) =>
  valueType === 'date' ? utils.startOfDay(utils.date()!) : utils.date()!;

const dateViews = ['year', 'month', 'day'];
export const isDatePickerView = (view: DateOrTimeViewWithMeridiem): view is DateView =>
  dateViews.includes(view);
