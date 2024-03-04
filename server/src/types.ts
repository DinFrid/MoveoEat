export enum MessageType {
  BUTTON = "button",
  TEXT = "text",
}

export enum ButtonResponseType {
  FEEDBACK = "feedback",
  RSVP = "rsvp",
}

export enum RSVPType {
  APPROVE_AND_NOT_VEG = "ברור, אני אוכל בשרי",
  APPROVE_AND_VEG = 'ברור, אני צמחוני',
  DISAPPROVE = 'לצערי לא מגיע',
  NO_RESPONSE = "NO_RESPONSE"
};

export interface WeekProps {
  days : DayProps[];
  weekID: string;
  schedule: string; 
};

export interface DayProps {
  menu: MenuProps;
  date: Date;
  confirmedLunchTotal: number;
  confirmedLunchVeg: number;
  disapproved: number;
}

export interface MenuProps {
  description : string;
  imageUrl?: string | null;
  rating?: RatingProps;
}

export interface RatingProps {
  avgRating: number;
  ratingCount: number;
};

export interface RSVPInteractionProps {
  RSVPStatus: RSVPType;
  expiration: Date;
}

export interface ContactProps {
  phoneNumber: string;
  rsvpInteraction: RSVPInteractionProps;
  ratingInteraction: RatingInteractionProps;
}

export interface RatingInteractionProps {
  hasRated: boolean;
  expiration: Date;
}

export enum MessageTemplate {
  RSVP_TEMPLATE = 'rsvp',
  SEND_NEXT_DAY_MENU_TEMPLATE = 'morning_menu_message',
  DISAPPROVED_RSVP_MESSAGE_TEMPLATE = 'rsvp_unapproved',
  APPROVED_RSVP_MESSAGE_TEMPLATE = 'rsvp_approved_template',
  FEEDBACK_REQUEST_MESSAGE_TEMPLATE = 'feedback_request',
  FEEDBACK_RESPONSE_MESSAGE_TEMPLATE = 'feedback_response',
  RATING_BLOCKED_RESPONSE_TEMPLATE = 'rating_blocked_response',
  EXPIRED_REQUEST_TEMPLATE = 'expired_request'
}

export enum FeedbackOptions {
  FIVE_STARS_FEEDBACK = '5',
  FOURSTARS_FEEDBACK = '4',
  THREE_STARS_FEEDBACK = '3',
  TWO_STARS_FEEDBACK = '2',
  ONE_STAR_FEEDBACK = '1'
};

export enum DAY_MODEL_ATTRIBUTES {
  DISSAPROVED_ATTRIBUTE = 'disapproved',
  CONFIRMED_LUNCH_TOTAL_ATTRIBUTE = 'confirmedLunchTotal',
  CONFIRMED_LUNCH_VEG = "confirmedLunchVeg"
}
