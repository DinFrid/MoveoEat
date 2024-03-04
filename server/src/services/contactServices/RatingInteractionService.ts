import { logger } from "../../app";
import { RATING_EXPIRATION_TIME_HOURS } from "../../consts";
import { createExpiration } from "../../dateUtils";
import { RatingInteractionModel } from "../../models/RatingInteractionModel";
import { ContactProps } from "../../types";

export const createDefaultRatingInteractionModel = () => {
    return new RatingInteractionModel({
        hasRated: false,
        expiration: createExpiration(RATING_EXPIRATION_TIME_HOURS),
    });
};

export const checkIfUserRatedAlready = (contactModel: ContactProps) => {
    logger.debug(`'contactModel' value is: ,${contactModel}`)
    
    return contactModel.ratingInteraction.hasRated;
}

