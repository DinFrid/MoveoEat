import { MenuModel } from "../../models/MenuModel";
import { MenuProps, RatingProps } from "../../types";

export const createMenuModel = ({description,imageUrl, rating} : MenuProps) => {
    return new MenuModel({
      description: description,
      imageUrl: imageUrl,
      rating: rating
    })
}

export const createDefaultMenuModel = (rating : RatingProps) => {
    return createMenuModel({description : ' ', rating: rating});
};