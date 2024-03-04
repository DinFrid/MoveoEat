import mongoose from 'mongoose';
import { IRatingModel, ratingSchema } from './RatingModel';

const schema = mongoose.Schema;

const menuSchema = new schema({
    description: { type: String, required: true },
    rating: { type: ratingSchema, required: true },
    imageUrl: { type: String, required: false },
});

const MenuModel = mongoose.model('MenuModel', menuSchema);

export { MenuModel, menuSchema };

export interface IMenuModel {
    _id: string;
    description: string,
    rating: IRatingModel,
    imageUrl: string
}