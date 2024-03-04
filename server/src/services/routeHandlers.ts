import { Request, Response } from "express";
import { MessageTemplate, MessageType, RSVPType, WeekProps } from "../types";
import { fetchRSVPByDay } from "./RSVPService";
import { WeekModel } from "../models/WeekModel";
import { contacts } from "../utils";
import { checkIfWeekExists, createDefaultWeekModel, fetchWeek, saveWeekModel } from "./modelServices/WeekService";
import { fetchRatingByDay, handleRatingResponse } from "./modelServices/RatingService";
import { sendCustomText, sendMessageByTemplate } from "./WhatsappBotUtils";
import { IDayModel } from "../models/DayModel";
import { ErrorMessages } from "../ErrorMessages";
import { setRSVPStatus } from "./contactServices/RSVPInteractionService";
import { checkIfContactIsExists, createDefaultContactModel, fetchContactByPhoneNumber, saveContactModel, setContactHasRated, updateContactRSVP } from "./contactServices/ContactService";
import { checkIfUserRatedAlready } from "./contactServices/RatingInteractionService";
import { checkIfExpirationTimeIsValid } from "../dateUtils";
import { logger } from "../app";

export const webHookInitializeHandler = (req: Request, res: Response) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    const validToken = "MoveoEatToken";
  
    if (mode === "subscribe" && token === validToken) {
      res.status(200).send(challenge);
    } else {
      res.status(403);
    }
};

export const webHookMessagesHandler = async (req: Request, res: Response) => {
  //console.debug('---------incoming webhook ------------');
  logger.debug(JSON.stringify(req.body));
  
  const bodyDoesntHasStatuses: boolean =
    !req.body.entry[0].changes[0].value.statuses;
  if (bodyDoesntHasStatuses) {
    logger.info('---------- incoming message------------');
    logger.debug(JSON.stringify(req.body));
    const senderNumber = req.body.entry[0].changes[0].value.messages[0].from;
    logger.info('phone number : ', senderNumber);
    const message = req.body.entry[0].changes[0].value.messages[0];
    const event: MessageType = message.type;
    switch (event) {
      case MessageType.BUTTON:
        handleButtonMessage(message.button.text,senderNumber);
        break;
      default:
    }
  }
  res.status(200).send("OK");
}

export const createDefaultWeekHandler = async (req: Request, res: Response) => {
  const {weekID} = req.query;
    
  logger.debug(`createDefaultWeekHandler entered with WeekID: ${weekID}`);
  
  const fetchedWeek = await fetchWeek(weekID as string);
  
  if(fetchedWeek) {
    res.status(200).json(fetchedWeek);
  }
  else {
    logger.info(`Week is not exists. creating a default one with WeelID: ${weekID}`);
    const defaultWeek = await createDefaultWeekModel(weekID as string);
    const newWeek = await saveWeekModel(defaultWeek);
    res.status(200).json(newWeek);
  }
}

export const updateWeekHandler = async (req: Request, res: Response) => {
    try { 
      const weekID : string = req.body.weekID;

      logger.debug(`updateWeekHandler entered with WeekID: ${weekID}`);

      const week : WeekProps = req.body;
      const days : IDayModel[] = req.body.days;

      logger.debug(days);

      if(!validateCreateWeekRequest(week)) {
          res.status(400).send(ErrorMessages.WRONG_PARAMETERS);
      }

      const isWeekExists = await checkIfWeekExists(weekID);

      if(isWeekExists) {

        const updateDaysMenuDescriptions = days.map(day => {
          return WeekModel.updateOne(
            { "weekID": weekID, "days._id": day._id },
            { $set: { "days.$.menu.description": day.menu.description } }
          )
        }
        );
        const updatedDays = await Promise.all(updateDaysMenuDescriptions);
        
        
        
        logger.info('updated days log: ',updatedDays);
        const updatedWeek = await fetchWeek(weekID);
        logger.debug(`'updatedWeek' value is: ,${updatedWeek}`)
        
        res.status(200).json(updatedWeek);
      }
      else {
        res.status(400).send(ErrorMessages.WEEK_NOT_FOUND(weekID))
      }
      
      res.status(200).json();
    } catch (error) {
        console.error('Error saving week:', error);
        res.status(500).send('Failed to save week');
    }
};

export const getWeekHandler = async (req: Request, res: Response) => {
  const {weekID} = req.query;

  logger.debug('fetching week. (getWeekHandler) with ID:',weekID);
  const fetchedWeek = await fetchWeek(weekID as string);
  logger.debug(`'fetchedWeek in GetWeekHandler' value is: ,${fetchedWeek}`);

    if(fetchedWeek) {
      logger.debug('getWeekHandler fetched week: ', fetchedWeek);
      res.status(200).json(fetchedWeek);
    }
    else {
      logger.error('couldnt fetch week in getWeekHandler. weekID:', weekID);
      
      res.status(400).send(ErrorMessages.WEEK_NOT_FOUND(weekID as string));
    }
      
   };

const validateCreateWeekRequest = (weekToAddDetails : WeekProps) => {
    //console.log('validation entered! week details: ', weekToAddDetails);
    return (weekToAddDetails.weekID && weekToAddDetails.days &&
         Array.isArray(weekToAddDetails.days) &&
          weekToAddDetails.days.length !== 0);
}

export const getRSVPHandler = async (req: Request, res: Response) => {
    const {day} = req.query;

    logger.debug(`getRSVPHandler entered with day date: ${day}`);

    const result = await fetchRSVPByDay(day as string);
    logger.info(`The RSVP result is: ${JSON.stringify(result)}`);

    if(result) {
      res.status(200).json(result);
    } else {
      res.status(400).send('Week Not Found!');
    }
}

export const handleButtonMessage = async (message: string, senderNumber: string) => {
  const contactIsExists = await checkIfContactIsExists(senderNumber);
  if(!contactIsExists) {
    logger.info('contact is not exists. creating a default one');
    const defaultContactModel = createDefaultContactModel(senderNumber);
    await saveContactModel(defaultContactModel);
    logger.debug(`'defaultContactModel' value is: ,${defaultContactModel}`)
  }
  const fetchedContact = await fetchContactByPhoneNumber(senderNumber);

  if (isRSVPResponse(message) && fetchedContact) {
      if(checkIfExpirationTimeIsValid(fetchedContact.rsvpInteraction.expiration)) {
        const newRSVPStatus = await setRSVPStatus(senderNumber, message,fetchedContact);
        updateContactRSVP(senderNumber,newRSVPStatus);
      } else {sendMessageByTemplate(senderNumber, MessageTemplate.EXPIRED_REQUEST_TEMPLATE)}
    } else {
      logger.debug(`'fetchedContact' value is: ,${fetchedContact}`);

      if(fetchedContact) {
        if(checkIfExpirationTimeIsValid(fetchedContact.ratingInteraction.expiration)) {
          if(checkIfUserRatedAlready(fetchedContact)) {
            sendMessageByTemplate(senderNumber,MessageTemplate.RATING_BLOCKED_RESPONSE_TEMPLATE);
          }
          else {
            handleRatingResponse(message,senderNumber);
            setContactHasRated(senderNumber);
          }
        } else {sendMessageByTemplate(senderNumber, MessageTemplate.EXPIRED_REQUEST_TEMPLATE)}
      } 
    }
  };

  function isRSVPResponse(message: string) {
    return message == RSVPType.APPROVE_AND_NOT_VEG || message == RSVPType.APPROVE_AND_VEG || message === RSVPType.DISAPPROVE;
  }

  export const getRatingHandler = async (req: Request, res: Response) => {
    const {day} = req.query;
    logger.info(`rating requested with 'day' value : ,${day}`)
    
    const result = await fetchRatingByDay(day as string);
    logger.debug('result : ',result);

    if(result) {
      res.status(200).json(result);
    } else {
      res.status(400).send('Week Not Found!');
    }
  } 

export const sendDirectMessageToAllContacts = (req: Request, res: Response) => {
  const messageToSend = req.body.messageToSend;
  contacts.forEach((contact) => {
    sendCustomText(contact,messageToSend);    
  })
};