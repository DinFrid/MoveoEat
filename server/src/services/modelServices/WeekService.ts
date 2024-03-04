import { IWeekModel, WeekModel } from "../../models/WeekModel";
import { DayProps, WeekProps } from "../../types";
import { Document } from 'mongoose';
import { createDefaultMenuModel } from "./MenuService";
import { getDatesOfWeek } from "../../dateUtils";
import { createDefaultDayModel, getDayModelByCurrentWeekModelAndDayIndex } from "./DayService";
import { createDefaultRatingModel } from "./RatingService";
import { logger } from "../../app";

export const checkIfWeekExists = (weekID : string) => {
  return WeekModel.exists({ weekID: weekID });
}

const createWeekModel = (weekProps : WeekProps) => {
    return new WeekModel({
      weekID: weekProps.weekID,
      days: weekProps.days,
      schedule: weekProps.schedule
    })
  }
  
  export const createAndSaveWeekModel = async (weekProps: WeekProps) => {
    const weekModel = createWeekModel(weekProps);
    return saveWeekModel(weekModel);
    
  };

  export const saveWeekModel = async (weekModel : Document) => {
    try {
      const savedWeekModel = await weekModel.save();
      logger.debug('Week model saved successfully:', savedWeekModel);
      return savedWeekModel;
    } catch (error) {
      logger.error('Error creating Week:', error);
      throw error;
    }
  };
  
  export const fetchWeek = async (weekID: string) => {
    try {
        const week = await WeekModel.findOne({ weekID: weekID });

        if(week) {
          return week.toObject() as IWeekModel;
        }
        else {
          return null;
        }
    } catch (error) {
        logger.error('Error fetching week :', error);
        return null;
    }
  };

export const createDefaultWeekModel = async (weekId: string) => {
  const defaultRating = createDefaultRatingModel();
  const defaultMenu = createDefaultMenuModel(defaultRating);
  
  let defaultDays : DayProps[] = [];
  const daysOfTheWeek = getDatesOfWeek(weekId)
  
  for (let i = 0; i < 5; i++) {
      let dayDate = daysOfTheWeek[i];
      let defaultDay = createDefaultDayModel(dayDate, defaultMenu); 
      defaultDays.push(defaultDay); 
  }
  const deafultDayProps = createWeekProps(weekId, defaultDays, ' ')
  return createWeekModel(deafultDayProps);

};

const createWeekProps = (weekID : string, days : DayProps[], schedule: string) => {
  return {
    weekID: weekID, 
    days: days, 
    schedule: schedule 
}
};

export const extractDayIDByWeekIDAndDayIndex = async (weekID : string, dayIndex : number) => {
  const fetchedWeek = await fetchWeek(weekID);

  if(fetchedWeek) {
    const nextDayModel = getDayModelByCurrentWeekModelAndDayIndex(fetchedWeek,dayIndex)
    
    if(nextDayModel) {
      return nextDayModel._id;
    }
  }
}

export const setDayAttributeAndUpdateWeekModelRSVP = (weekID: string, dayModelID: string, attributeToUpdate: string, toIncrementFlag : boolean) => {
  const incrementSum = toIncrementFlag ? 1 : -1;//1: increment by 1, -1 decrement by 1
  //To handle situation when the attribute is 0 and increment sum is -1
  
  const update = {
    $inc: { [`days.$[elem].${attributeToUpdate}`]: incrementSum }
  };

  WeekModel.updateOne(
    { weekID: weekID },
    update,
    { arrayFilters: [{ "elem._id": dayModelID }] }
  )
  .then(result => logger.info(`Updated ${attributeToUpdate} successfully`, result))
  .catch(error => logger.error(`Error updating ${attributeToUpdate}`, error));
};
