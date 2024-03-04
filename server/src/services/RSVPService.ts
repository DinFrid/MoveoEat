import { getWeekIDByDate } from "../dateUtils";
import { DAY_MODEL_ATTRIBUTES, MessageTemplate, RSVPType } from "../types";
import dotenv from "dotenv";
import { setDayAttributeAndUpdateWeekModelRSVP, fetchWeek } from "./modelServices/WeekService";
import { sendMessageByTemplate } from "./WhatsappBotUtils";
import { getDayModelByCurrentWeekModelAndDayIndex } from "./modelServices/DayService";
import { logger } from "../app";

dotenv.config();

const isDisapprovedRSVPResponse = (rsvpStatus : string) => {
  return rsvpStatus === RSVPType.DISAPPROVE;
}

const updateDayAndSendRSVPResponseMessage = 
( currentWeekID : string,
  tomorrowDayModelID : string,
  attributeToUpdate : string,
  senderNumber : string,
  messageTemplate : string,
  incrementFlag : boolean
  ) => {
  setDayAttributeAndUpdateWeekModelRSVP(currentWeekID,tomorrowDayModelID,attributeToUpdate,incrementFlag);
  sendMessageByTemplate(senderNumber, messageTemplate); 
}

function isVeg(rsvpStatus: string) {
  return rsvpStatus === RSVPType.APPROVE_AND_VEG;
}

export const handleRSVPResponse = async (rsvpStatus: RSVPType,senderNumber: string) => {
  const incrementFlag = true;

  const todayDate = new Date();
  const currentWeekID = getWeekIDByDate(todayDate);
  const tomorrowDay = todayDate.getDay() + 1;
  //const tomorrowDay = todayDate.getDay() - 2// For demo only

  const currentWeekModel = await fetchWeek(currentWeekID);


  if(currentWeekModel) {
    const tomorrowDayModel = getDayModelByCurrentWeekModelAndDayIndex(currentWeekModel, tomorrowDay);
    if(tomorrowDayModel) {
      if(isDisapprovedRSVPResponse(rsvpStatus)) {
        updateDayAndSendRSVPResponseMessage(
          currentWeekID,tomorrowDayModel._id,DAY_MODEL_ATTRIBUTES.DISSAPROVED_ATTRIBUTE,senderNumber, MessageTemplate.DISAPPROVED_RSVP_MESSAGE_TEMPLATE,incrementFlag );
        return;
      }
      setDayAttributeAndUpdateWeekModelRSVP(currentWeekID,tomorrowDayModel._id,DAY_MODEL_ATTRIBUTES.CONFIRMED_LUNCH_TOTAL_ATTRIBUTE, incrementFlag);
      
      if(isVeg(rsvpStatus)) {
        updateDayAndSendRSVPResponseMessage(
          currentWeekID,tomorrowDayModel._id,DAY_MODEL_ATTRIBUTES.CONFIRMED_LUNCH_VEG,senderNumber,MessageTemplate.APPROVED_RSVP_MESSAGE_TEMPLATE, incrementFlag);
      } else {
        sendMessageByTemplate(senderNumber,MessageTemplate.APPROVED_RSVP_MESSAGE_TEMPLATE);
      }
    } 
    else {console.error('day has not found');}
  }  
    else {console.error('Week has not found');}

};


export const fetchRSVPByDay = async (dayToFetch : string) => {
  const dayToFetchDateFormatted = new Date(dayToFetch);
  const weekID = getWeekIDByDate(dayToFetchDateFormatted);
  logger.debug('fetching week. (fetchRSVPByDay) WeekID:', weekID);
  const currentWeekModel = await fetchWeek(weekID);

  if(currentWeekModel) {
    const fetchedDayModel = getDayModelByCurrentWeekModelAndDayIndex(currentWeekModel,dayToFetchDateFormatted.getDay());
    
    if(fetchedDayModel) {
      return createRSVPResponse(fetchedDayModel.confirmedLunchTotal, fetchedDayModel.confirmedLunchVeg, fetchedDayModel.disapproved);
    
    } else {logger.error('Day not found. (fetchRSVPByDay)')}

  } else {logger.error('Week not found. (fetchRSVPByDay)')}
};

const createRSVPResponse = (confirmedLunchTotal: number, confirmedLunchVeg: number, disapproved: number) => {
  return {
    approveNormal : (confirmedLunchTotal - confirmedLunchVeg),
    approveVeggie : confirmedLunchVeg,
    disapprove : disapproved
  }
}
