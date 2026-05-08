import { isAfter, isBefore, parseISO } from 'date-fns';

export const isSessionLive = (
  startTime: Date | string,
  endTime: Date | string
): boolean => {
  const now = new Date();
  
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;

  return (isAfter(now, start) || now.getTime() === start.getTime()) && 
         (isBefore(now, end) || now.getTime() === end.getTime());
};


export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};