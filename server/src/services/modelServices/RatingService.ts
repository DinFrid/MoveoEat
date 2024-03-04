import { logger } from "../../app";
import { getWeekIDByDate } from "../../dateUtils";
import { RatingModel } from "../../models/RatingModel";
import { WeekModel } from "../../models/WeekModel";
import { MessageTemplate, RatingProps } from "../../types";
import { sendMessageByTemplate } from "../WhatsappBotUtils";
import { getDayModelByCurrentWeekModelAndDayIndex } from "./DayService";
import { fetchWeek } from "./WeekService";

export const createRatingModel = ({avgRating,ratingCount} : RatingProps) => {
    return new RatingModel({
      avgRating: avgRating,
      ratingCount: ratingCount,
    })
};

export const createDefaultRatingModel = () => {
    return createRatingModel({avgRating: 0, ratingCount: 0});
};

export const fetchRatingByDay = async (dayToFetch : string) => {
  const dayToFetchDateFormatted = new Date(dayToFetch);
  const weekID = getWeekIDByDate(dayToFetchDateFormatted);
  const requestedDayIndex = dayToFetchDateFormatted.getDay();
  logger.debug('fetching week. (fetchRatingByDay) weekID:', weekID);
  const currentWeekModel = await fetchWeek(weekID);

  if(currentWeekModel) { 
    const fetchedDayModel = getDayModelByCurrentWeekModelAndDayIndex(currentWeekModel,requestedDayIndex);
    
    if(fetchedDayModel) {
      const fetchedRating = fetchedDayModel.menu.rating

      const returnRatingResponse =  createRatingResponse(fetchedRating.avgRating, fetchedRating.ratingCount)
      return returnRatingResponse

    } else {logger.error('Day not found. (fetchRatingByDay)')}

  } else {logger.error('Week not found. (fetchRatingByDay)')}

}

export const handleRatingResponse = async (message: string, senderNumber: string) => {

    const todayDate = new Date();
    const currentWeekID = getWeekIDByDate(todayDate);
    const todayDateByDay = todayDate.getDay()
    //const todayDateByDay = todayDate.getDay() - 2;//TO CHANGE BACK 
    
    const currentWeekModel = await fetchWeek(currentWeekID);
      if(currentWeekModel) {

        const todayDayModel = getDayModelByCurrentWeekModelAndDayIndex(currentWeekModel,todayDateByDay)

        const updatedAvgRating = calculateAvgRating(message,todayDayModel?.menu.rating.avgRating as number, todayDayModel?.menu.rating.ratingCount as number);

        if(todayDayModel) {
          updateWeekModelRating(currentWeekID,updatedAvgRating,todayDayModel._id);
        } else {console.log('Day not found. (handleRatingResponse)')}

        sendRatingResponseMessage(senderNumber);

      } else {console.log('Week not found. (handleRatingResponse)')}

  };

function calculateAvgRating(message: string, currentAvgRating : number, ratingCount : number) {
  const recievedRating = Number(message);
  const newTotalRating = recievedRating + currentAvgRating * ratingCount;
  const newRatingCount = ratingCount + 1;
  
  return newTotalRating / newRatingCount;
};

const createRatingResponse = (avgRating : number, ratingCount: number) => {
  const formattedAvgRating = parseFloat(avgRating.toFixed(1));
  
  return {
    avgRating: formattedAvgRating,
    ratingCount: ratingCount
  };
};

const updateWeekModelRating = (currentWeekID: string, updatedAvgRating: number, dayModelID: string) => {
  WeekModel.updateOne(
    { weekID: currentWeekID },
    { $inc: { "days.$[elem].menu.rating.ratingCount": 1 },
      $set: { "days.$[elem].menu.rating.avgRating": updatedAvgRating } },
    {
      arrayFilters: [ { "elem._id": dayModelID } ],
      new: true
    }
  )
  .then(result => console.log('Updated ratingCount successfully', result))
  .catch(error => console.error('Error updating ratingCount', error));
};

const sendRatingResponseMessage = (senderNumber: string) => {
  sendMessageByTemplate(senderNumber,MessageTemplate.FEEDBACK_RESPONSE_MESSAGE_TEMPLATE);
}

