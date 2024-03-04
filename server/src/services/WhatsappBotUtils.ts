import axios from "axios";
import dotenv from "dotenv";
import { logger } from "../app";

dotenv.config();

const base_url = process.env.BASE_URL;
const phonenumber_id = process.env.PHONE_NUMBER_ID;
const url = `${base_url}/${phonenumber_id}/messages`;
const accessToken = process.env.OMER_TOKEN;

export const sendMessageByTemplate = async (phonenumber: string, template : string) => {
  //console.log('--------entered messageByTemplate number :', phonenumber);
  //console.log('template : ', template);

  const data = {
    messaging_product: "whatsapp",
    recepient_type: "individual",
    to: phonenumber,
    type: "template",
    template: {
      name: template,
      language: {
        code: "he",
      },
    },
  };

  //console.log('data : ', data);

  try {
    axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendScheduledMessageByTemplate = (phoneNumber: string,template : string) => {
    sendMessageByTemplate(phoneNumber, template);
};

export const sendCustomText = async (phonenumber: string, text: string) => {
  const data = {
    messaging_product: "whatsapp",
    recepient_type: "individual",
    to: `${phonenumber}`,
    type: "text",
    text: { body: `${text}` },
  };

  try {
    console.log(url);

    axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendTemplateMorningMessage = async (phonenumber: string, menu : string, dayName : string) => {
  logger.debug('--------entered messageByTemplate number :', phonenumber);

  const data = {
    messaging_product: "whatsapp",
    recepient_type: "individual",
    to: phonenumber,
    type: "template",
    template: {
      name: "menu",
      language: {
        code: "he",
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: menu
            },
            {
              type: "text",
              text: dayName
            }
          ]
        }
      ]
    },
  };

  logger.debug('data : ', JSON.stringify(data));

  try {
    axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    logger.error(error);
  }
};