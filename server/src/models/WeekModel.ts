import mongoose from 'mongoose';
import { IDayModel, daySchema } from './DayModel'; 

const schema = mongoose.Schema;

const weekSchema = new schema({
    weekID: { type: String, required: true }, // YYYY-MM-DD
    days: {type: [daySchema], required: true}, 
    schedule: { type: String, required: true },
});

export const WeekModel = mongoose.model('Week', weekSchema);

export interface IWeekModel {
    _id: string;
    weekID: string,
    days: IDayModel[],
    schedule: string
}