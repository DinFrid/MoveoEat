import mongoose from 'mongoose';

const schema = mongoose.Schema;

const ratingSchema = new schema({
    ratingCount: { type: Number, required: true },
    avgRating: { type: Number, required: true },
});

const RatingModel = mongoose.model('RatingModel', ratingSchema);

export { RatingModel, ratingSchema };

export interface IRatingModel {
    _id: string;
    ratingCount: number,
    avgRating: number
};