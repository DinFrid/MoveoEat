import mongoose from 'mongoose';
import { IRSVPInteractionModel, rsvpInteractionSchema } from './RSVPInteractionModel';
import { IRatingInteractionModel, ratingInteractionSchema } from './RatingInteractionModel';

const schema = mongoose.Schema;

const contactSchema = new schema({
    phoneNumber: {type: String, required: true},
    rsvpInteraction: {type: rsvpInteractionSchema, required: true},
    ratingInteraction: {type: ratingInteractionSchema, required: true}
});

const ContactModel = mongoose.model('ContactModel', contactSchema);

export { ContactModel, contactSchema };

export interface IContactModel extends Document{
    _id: string,
    rsvpInteraction: IRSVPInteractionModel,
    ratingInteraction: IRatingInteractionModel
}