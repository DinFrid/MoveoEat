import { ContactModel } from "../../models/Contact"
import { IRSVPInteractionModel } from "../../models/RSVPInteractionModel"
import { ContactProps, RSVPType } from "../../types";
import { Document } from 'mongoose';
import { createDefaultRSVPInteractionModel } from "./RSVPInteractionService";
import { createDefaultRatingInteractionModel } from "./RatingInteractionService";
import { logger } from "../../app";

export const createContactModel = (contactProps : ContactProps) => {
    return new ContactModel({
        phoneNumber: contactProps.phoneNumber,
        rsvpInteraction: contactProps.rsvpInteraction,
        ratingInteraction: contactProps.ratingInteraction
    })
};

export const createDefaultContactModel = (phoneNumber : string) => {
    return new ContactModel({
        phoneNumber: phoneNumber,
        rsvpInteraction: createDefaultRSVPInteractionModel(),
        ratingInteraction: createDefaultRatingInteractionModel()
    })
};

export const saveContactModel = async (contactModel : Document) => {
    try {
        const savedContactModel = await contactModel.save();
        //console.log('Contact model saved successfully:', savedContactModel);
        return savedContactModel;
      } catch (error) {
        console.error('Error creating Contact:', error);
        throw error;
      }
}

export const createAndSaveContactModel = async (contactProps: ContactProps) => {
    const contactModel = createContactModel(contactProps);
    const savedModel = await saveContactModel(contactModel);
    return savedModel;
};

export const fetchContactByPhoneNumber = async (contactPhoneNumber : string) => {
    try {
        const fetchedContact = await ContactModel.findOne({ phoneNumber: contactPhoneNumber });

        return fetchedContact ? fetchedContact : null;
       
    } catch (error) {
        console.error('Error fetching contact :', error);
        return null;
    }
};

export const updateContactRSVP = async (senderNumber : string, newRSVPStatus : RSVPType) => {
    const fetchedContact = await fetchContactByPhoneNumber(senderNumber);

    if(fetchedContact) {
        ContactModel.updateOne(
            { phoneNumber: senderNumber },
            {$set: { [`rsvpInteraction.RSVPStatus`]: newRSVPStatus }},
          )
          .then(result => console.log(`Updated rsvpInteraction.RSVPStatus successfully`, result))
          .catch(error => console.error(`Error updating rsvpInteraction.RSVPStatus`, error));
    } 
};

export const checkIfContactIsExists = async (phoneNumber: string) => {
    const contactIsExists = await ContactModel.exists({phoneNumber: phoneNumber});
    logger.debug(`'contactIsExists' value is: ,${contactIsExists}`)
    
    return contactIsExists === null ? false : true;
};

export const setContactHasRated = async (senderNumber : string) => {

    ContactModel.updateOne(
        { phoneNumber: senderNumber },
        {$set: { [`ratingInteraction.hasRated`]: true }},
        )
        .then(result => console.log(`Updated rsvpInteraction.RSVPStatus successfully`, result))
        .catch(error => console.error(`Error updating rsvpInteraction.RSVPStatus`, error));
};

export const resetInteractionsForContact = async (phoneNumber : string) => {
    try {
      const defaultRSVP = createDefaultRSVPInteractionModel();
      const defaultRating = createDefaultRatingInteractionModel();
  
      const updatedContact = await ContactModel.findOneAndUpdate(
        { phoneNumber: phoneNumber },
        {
          $set: {
            rsvpInteraction: defaultRSVP,
            ratingInteraction: defaultRating,
          },
        }
      );
  
      logger.info('Contact interactions reset successfully:', updatedContact);
      return updatedContact;
    } catch (error) {
      console.error('Error resetting contact interactions:', error);
      throw error;
    }
  };

export const resetRSVPInteractionForAllContacts = async () => {
try {
    const result = await ContactModel.updateMany(
    {}, 
    { $set: {rsvpInteraction: createDefaultRSVPInteractionModel(),}}
    );

    logger.info(`RSVPInteraction reset for ${JSON.stringify(result)} contacts.`);
} catch (error) {
    console.error('Error resetting RSVPinteraction:', error);
}
};

export const resetRatingInteractionForAllContacts = async () => {
    try {
        const result = await ContactModel.updateMany(
        {}, 
        { $set: {ratingInteraction: createDefaultRatingInteractionModel()}}
        );
    
        logger.info(`RatingInteractiob reset for ${JSON.stringify(result)} contacts.`);
    } catch (error) {
        console.error('Error resetting RatingInteraction:', error);
    }
    };

