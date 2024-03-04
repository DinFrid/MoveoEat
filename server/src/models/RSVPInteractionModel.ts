import mongoose from 'mongoose';
import { RSVPType } from '../types'; // Adjust the import path as necessary

const rsvpInteractionSchema = new mongoose.Schema({
  RSVPStatus: {
    type: String,
    enum: Object.values(RSVPType),
    default: RSVPType.NO_RESPONSE,
  },
  expiration: { type: Date, required: true },
});

const RSVPInteractionModel = mongoose.model('RSVPInteractionModel', rsvpInteractionSchema);

export { RSVPInteractionModel, rsvpInteractionSchema };
export interface IRSVPInteractionModel {
    _id: string,
    RSVPStatus: RSVPType,
    expiration: Date
};