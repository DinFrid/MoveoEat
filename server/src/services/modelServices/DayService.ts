import { DayModel } from "../../models/DayModel"
import { IWeekModel } from "../../models/WeekModel";
import { DayProps, MenuProps } from "../../types"

export const createDayModel = (dayProps : DayProps) => {
    return new DayModel({
      menu: dayProps.menu,
      date: dayProps.date,
      confirmedLunchTotal: dayProps.confirmedLunchTotal,
      confirmedLunchVeg: dayProps.confirmedLunchVeg,
      disapproved: dayProps.disapproved
    })
};

export const createDefaultDayModel = (dayDate: Date ,menu : MenuProps) => {
    
    
    return createDayModel({menu : menu, date: dayDate, confirmedLunchTotal: 0, confirmedLunchVeg: 0, disapproved: 0});
};

export const getDayModelByCurrentWeekModelAndDayIndex = (currentWeekModel : IWeekModel, requestedDayIndex : number) => {
  const currentDayModel = currentWeekModel.days.find(day => 
    day.date.getDay() === requestedDayIndex );
  
    //console.log(currentDayModel);
    return currentDayModel;
}