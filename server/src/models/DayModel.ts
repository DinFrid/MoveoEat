import mongoose from 'mongoose';
import { IMenuModel, menuSchema } from './MenuModel';

const schema = mongoose.Schema;

const daySchema = new schema({
    menu: {type: menuSchema, required: true},
    date: { type: Date, required: true },
    confirmedLunchTotal: {type: Number, required: true},
    confirmedLunchVeg: {type: Number, required: true},
    disapproved : {type: Number, required: true}
});

const DayModel = mongoose.model('DayModel', daySchema);

export { DayModel, daySchema };

export interface IDayModel {
    _id: string;
    menu: IMenuModel,
    date: Date,
    confirmedLunchTotal: number,
    confirmedLunchVeg: number,
    disapproved: number
}