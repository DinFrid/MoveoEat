import { logger } from "./app";

export function getWeekIDByDate(date: Date): string {
    const dayOfWeek = date.getDay();
    const previousSunday = new Date(date);
    previousSunday.setDate(date.getDate() - dayOfWeek);
    return previousSunday.toISOString().split("T")[0];
  }
  
  export const getDatesOfWeek = (sundayString: string): Date[] => {
    const startDate = new Date(sundayString);
    const weekDates: Date[] = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  export const formatToDay = (date: Date) => {
    console.log(`the 'date' value is: ,${date}`);
  
    const formatter = new Intl.DateTimeFormat("en", { weekday: "long" });
    const formattedDay = formatter.format(date);
    return formattedDay;
  };

  export const currentTimeInIsrael = () => {
    const now = new Date();
    const timeOffsetInMilliseconds = now.getTimezoneOffset() * 60000; 
    const ISTOffset = 2; 
    const ISTOffsetInMilliseconds = ISTOffset * 3600000; 
    return new Date(now.getTime() + timeOffsetInMilliseconds + ISTOffsetInMilliseconds);
  };

  export const checkIfExpirationTimeIsValid = (expiration : Date) => {
    logger.debug(`'expiration' value is: ,${expiration}`)
    logger.debug('current time is: ', currentTimeInIsrael());
    
    return currentTimeInIsrael() < expiration;
};

export const createExpiration = (hourToSetExpiration : number) => {
  const expiration = currentTimeInIsrael();
  expiration.setHours(expiration.getHours() + hourToSetExpiration, 0, 0, 0); 
  return expiration;
};