const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const getDatePart = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return '';
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const validateApplicationDates = ({ dateApplied, nextActionDate }) => {
  const appliedDate = getDatePart(dateApplied);
  const actionDate = getDatePart(nextActionDate);

  if (dateApplied && !DATE_PATTERN.test(appliedDate)) {
    return 'Date applied must be a valid date.';
  }

  if (nextActionDate && !DATE_PATTERN.test(actionDate)) {
    return 'Next action date must be a valid date.';
  }

  if (appliedDate && appliedDate > getTodayDate()) {
    return 'Date applied cannot be in the future.';
  }

  if (appliedDate && actionDate && actionDate < appliedDate) {
    return 'Next action date cannot be earlier than date applied.';
  }

  return null;
};

module.exports = { getDatePart, validateApplicationDates };
