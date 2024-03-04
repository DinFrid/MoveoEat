import { logger } from "../../app";
import { RSVP_EXPIRATION_TIME_HOURS } from "../../consts";
import { createExpiration, getWeekIDByDate } from "../../dateUtils";
import { RSVPInteractionModel } from "../../models/RSVPInteractionModel";
import { ContactProps, DAY_MODEL_ATTRIBUTES, MessageTemplate, RSVPType } from "../../types";
import { handleRSVPResponse } from "../RSVPService";
import { sendMessageByTemplate } from "../WhatsappBotUtils";
import { extractDayIDByWeekIDAndDayIndex, setDayAttributeAndUpdateWeekModelRSVP } from "../modelServices/WeekService";

export const createDefaultRSVPInteractionModel = () => {
    return new RSVPInteractionModel({
        RSVPStatus: RSVPType.NO_RESPONSE,
        expiration: createExpiration(RSVP_EXPIRATION_TIME_HOURS),
    });
};

const mapMessageToRSVPStatus = (message : string) => {
    switch(message) {
        case(RSVPType.APPROVE_AND_NOT_VEG) : return RSVPType.APPROVE_AND_NOT_VEG;
        case(RSVPType.APPROVE_AND_VEG) : return RSVPType.APPROVE_AND_VEG;
        case(RSVPType.DISAPPROVE) : return RSVPType.DISAPPROVE;
        default : return RSVPType.NO_RESPONSE;
    }
};

export const setRSVPStatus = async (contactPhoneNumber: string ,message : string, contactModel : ContactProps) => {
    const newRSVPStatus = mapMessageToRSVPStatus(message);
    
    const currentRSVPStatus = contactModel.rsvpInteraction.RSVPStatus;
    const nextDayIndex = new Date().getDay() + 1;
    const weekID = getWeekIDByDate(new Date());//Handle saturday situation
    const nextDayID = await extractDayIDByWeekIDAndDayIndex(weekID, nextDayIndex);
    logger.debug(`'currentRSVPStatus' value is: ,${currentRSVPStatus}`)
    
    switch(currentRSVPStatus) {
        case(RSVPType.NO_RESPONSE) : {
            handleRSVPResponse(newRSVPStatus,contactPhoneNumber);
            break;
        }
        case(RSVPType.APPROVE_AND_VEG) : {
            const messageTemplate = handleAprroveAndVegStatusChangeAndReturnMessageTemplate(newRSVPStatus,nextDayID as string, weekID);
            sendMessageByTemplate(contactPhoneNumber,messageTemplate); 
            break;
        }
        case(RSVPType.APPROVE_AND_NOT_VEG) : {
            const messageTemplate = handleAprroveAndNotVegStatusChangeAndReturnMessageTemplate(newRSVPStatus,nextDayID as string, weekID);
            sendMessageByTemplate(contactPhoneNumber,messageTemplate); 
            break;
        }
        case(RSVPType.DISAPPROVE) : {
            const messageTemplate = handleDisaprroveStatusChangeAndReturnMessageTemplate(newRSVPStatus,nextDayID as string, weekID);
            sendMessageByTemplate(contactPhoneNumber,messageTemplate); 
            break;
        }
    }
    return newRSVPStatus;

};

const handleAprroveAndVegStatusChangeAndReturnMessageTemplate = (newRSVPState : RSVPType, nextDayID : string, weekID : string) => {

    switch(newRSVPState) {
        case(RSVPType.APPROVE_AND_NOT_VEG) : {
            decrementDayAttribute(weekID,nextDayID,DAY_MODEL_ATTRIBUTES.CONFIRMED_LUNCH_VEG);
            return MessageTemplate.APPROVED_RSVP_MESSAGE_TEMPLATE as string;
        }
        case(RSVPType.DISAPPROVE) : {
            incrementDayAttribute(weekID,nextDayID,DAY_MODEL_ATTRIBUTES.DISSAPROVED_ATTRIBUTE);
            decrementDayAttribute(weekID,nextDayID,DAY_MODEL_ATTRIBUTES.CONFIRMED_LUNCH_VEG);
            decrementDayAttribute(weekID,nextDayID,DAY_MODEL_ATTRIBUTES.CONFIRMED_LUNCH_TOTAL_ATTRIBUTE)
            return MessageTemplate.DISAPPROVED_RSVP_MESSAGE_TEMPLATE;
        }
        default: return MessageTemplate.APPROVED_RSVP_MESSAGE_TEMPLATE;
    }
};

const handleAprroveAndNotVegStatusChangeAndReturnMessageTemplate = (newRSVPState : RSVPType, nextDayID : string, weekID : string) => {

    switch(newRSVPState) {
        case(RSVPType.APPROVE_AND_VEG) : {
            incrementDayAttribute(weekID,nextDayID,DAY_MODEL_ATTRIBUTES.CONFIRMED_LUNCH_VEG);
            return MessageTemplate.APPROVED_RSVP_MESSAGE_TEMPLATE;
        }
        case(RSVPType.DISAPPROVE) : {
            decrementDayAttribute(weekID,nextDayID,DAY_MODEL_ATTRIBUTES.CONFIRMED_LUNCH_TOTAL_ATTRIBUTE);
            incrementDayAttribute(weekID,nextDayID,DAY_MODEL_ATTRIBUTES.DISSAPROVED_ATTRIBUTE);
            return MessageTemplate.DISAPPROVED_RSVP_MESSAGE_TEMPLATE;
        }
        default: return MessageTemplate.APPROVED_RSVP_MESSAGE_TEMPLATE;

    }
};

const handleDisaprroveStatusChangeAndReturnMessageTemplate = (newRSVPState : RSVPType, nextDayID : string, weekID : string) => {

    switch(newRSVPState) {
        case(RSVPType.APPROVE_AND_VEG) : {
            incrementDayAttribute(weekID,nextDayID,DAY_MODEL_ATTRIBUTES.CONFIRMED_LUNCH_VEG);
            incrementDayAttribute(weekID,nextDayID,DAY_MODEL_ATTRIBUTES.CONFIRMED_LUNCH_TOTAL_ATTRIBUTE);
            decrementDayAttribute(weekID,nextDayID,DAY_MODEL_ATTRIBUTES.DISSAPROVED_ATTRIBUTE);
            return MessageTemplate.APPROVED_RSVP_MESSAGE_TEMPLATE;
        }
        case(RSVPType.APPROVE_AND_NOT_VEG) : {
            incrementDayAttribute(weekID,nextDayID,DAY_MODEL_ATTRIBUTES.CONFIRMED_LUNCH_TOTAL_ATTRIBUTE);
            decrementDayAttribute(weekID,nextDayID,DAY_MODEL_ATTRIBUTES.DISSAPROVED_ATTRIBUTE);
            return MessageTemplate.APPROVED_RSVP_MESSAGE_TEMPLATE;
            ;
        }
        default: return MessageTemplate.APPROVED_RSVP_MESSAGE_TEMPLATE;

    }
};

const incrementDayAttribute = (weekID: string, nextDayID: string, dayAttribute : DAY_MODEL_ATTRIBUTES) => {
    const toIncrementFlag = true;
    setDayAttributeAndUpdateWeekModelRSVP(weekID,nextDayID,dayAttribute,toIncrementFlag);
};

const decrementDayAttribute = (weekID: string, nextDayID: string, dayAttribute : DAY_MODEL_ATTRIBUTES) => {
    const toIncrementFlag = false;
    setDayAttributeAndUpdateWeekModelRSVP(weekID,nextDayID,dayAttribute,toIncrementFlag);
}
