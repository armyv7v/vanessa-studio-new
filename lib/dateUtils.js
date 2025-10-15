// lib/dateUtils.js
import { addDays } from 'date-fns';

export const getNextDays = (count = 21) => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const nextDay = addDays(today, i);
    days.push(nextDay);
  }
  return days;
};