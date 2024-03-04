import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from 'mongoose';
import { updateWeekHandler, getRSVPHandler, getRatingHandler, getWeekHandler, sendDirectMessageToAllContacts, webHookInitializeHandler, webHookMessagesHandler, createDefaultWeekHandler } from "./services/routeHandlers";
import { sendMorningMessagesToAllContacts, sendRatingRequestMessageToAllContacts } from "./services/ChatBotMessagesService";
import { fetchWeek } from "./services/modelServices/WeekService";
import { getWeekIDByDate } from "./dateUtils";
import { IWeekModel } from "./models/WeekModel";
import { resetRSVPInteractionForAllContacts, resetRatingInteractionForAllContacts } from "./services/contactServices/ContactService";

const cron = require('node-cron');
dotenv.config();
const app = express();

const port = process.env.SERVER_PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use((req,res,next) => {
  res.setHeader('ngrok-skip-browser-warning','skip-browser-warning')
  next();
});

const winston = require('winston');
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.cli(),
  transports: [new winston.transports.Console()],
});
logger.info(`'process.env.LOG_LEVEL' value is: ${process.env.LOG_LEVEL}`)

app.options('*',cors());

mongoose.connect(process.env.MONGO_CONNECTION_URL as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error: any) => console.error('Connection error', error));

app.get("/webhook", webHookInitializeHandler);

app.post("/webhook", webHookMessagesHandler);

app.put('/week', updateWeekHandler);

app.get('/week', getWeekHandler);

app.post('/week', createDefaultWeekHandler)

app.get('/rsvp', getRSVPHandler);

app.get('/rating',getRatingHandler);

app.post('/direct-message', sendDirectMessageToAllContacts);

const sendMorningMessage = async () => {
  const week = await fetchWeek(getWeekIDByDate(new Date()));
  sendMorningMessagesToAllContacts(week as IWeekModel);
}

//sendMorningMessage();
//sendRatingRequestMessageToAllContacts();

cron.schedule('55 00 11 * * 0-3', () => {
  console.log('Scheduled morning message sent to all contacts between sunday to wednsday');
  sendMorningMessage();
  resetRSVPInteractionForAllContacts();
}, {
  scheduled: true,
  timezone: "Asia/Jerusalem"
});

cron.schedule('00 29 10 * * 0-4', () => {
  console.log('Scheduled rating message sent to all contacts between sunday to thursday');
  sendRatingRequestMessageToAllContacts();
  resetRatingInteractionForAllContacts();
}, {
  scheduled: true,
  timezone: "Asia/Jerusalem"
});

//sendTemplateMorningMessage('+972543069499',' `סלמון\nסלמון\nסלמון\nסלמון\nסלמון`');


