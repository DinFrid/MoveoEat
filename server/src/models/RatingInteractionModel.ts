import mongoose from 'mongoose';
import { RSVPType } from '../types';

const schema = mongoose.Schema;

const ratingInteractionSchema = new schema({
    hasRated: {type: Boolean, default: false},
    expiration: {type: Date, required: true},
});

const RatingInteractionModel = mongoose.model('RatingInteractionModel', ratingInteractionSchema);

export { RatingInteractionModel, ratingInteractionSchema };

export interface IRatingInteractionModel {
    _id: string,
    RSVPStatus: RSVPType,
    hasRated: boolean,
    expiration: Date
}