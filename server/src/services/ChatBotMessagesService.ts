import { MessageTemplate } from "../types";
import { contacts } from "../utils";
import { sendScheduledMessageByTemplate, sendTemplateMorningMessage } from "./WhatsappBotUtils";
import { IWeekModel } from "../models/WeekModel";
import { logger } from "../app";

export const sendNextDayMenuMessageToContact = (currentWeek: IWeekModel, senderNumber: string) => {
   const today = new Date();
   const tomorrow = new Date(today);
   tomorrow.setDate(today.getDate() + 1);

   const tomorrowDayModel = currentWeek.days.find(day => {
       const dayDate = new Date(day.date);
       return dayDate.getDate() === tomorrow.getDate() &&
              dayDate.getMonth() === tomorrow.getMonth() &&
              dayDate.getFullYear() === tomorrow.getFullYear();
   });

   const tomorrowDayInHebrew = new Intl.DateTimeFormat('he-IL', { weekday: 'long' }).format(tomorrow);

   const dailyMenu = tomorrowDayModel?.menu.description;

   logger.debug('daily menu : ', dailyMenu);
   logger.debug(`'tomorrowDayInHebrew' value is: ,${tomorrowDayInHebrew}`);

   if (dailyMenu) {
       sendTemplateMorningMessage(senderNumber, dailyMenu, tomorrowDayInHebrew);
   } else {
      logger.warning('No menu found for tomorrow.');
   }
};



export const sendMorningMessagesToAllContacts = (currentWeek: IWeekModel) => {
   logger.debug('--------sendMorningMessagesToAllContacts entered -----------')
   logger.debug(currentWeek);
   
   contacts.forEach(async (contact) => {
      sendNextDayMenuMessageToContact(currentWeek, contact);
   });
};

export const sendRatingRequestMessageToAllContacts = () => {
   contacts.forEach(async (contact) => {
      sendScheduledMessageByTemplate(contact,MessageTemplate.FEEDBACK_REQUEST_MESSAGE_TEMPLATE);
   });
};

