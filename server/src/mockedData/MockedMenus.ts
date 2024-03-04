
import { DayProps, MenuProps, RatingProps } from "../types"

const mockedSundayRating: RatingProps = {
  avgRating: 2,
  ratingCount: 50,
};

const mockedsundayMenu: MenuProps = {
  description: 'קציצות עגל',
  imageUrl: 'TestURL',
  rating: mockedSundayRating,
};

const mockedSundayModel: DayProps = {
  menu: mockedsundayMenu, 
  date: new Date(),
  confirmedLunchTotal: 100,
  confirmedLunchVeg: 15,
  disapproved: 5,
};
  
  // const mockedMondayModel = createDayModel({
  //   meals: 'בר סלטים',
  //   date: new Date(),
  //   imageUrl: 'testUrl'
  // })
  
  // const mockedTuesdayModel = createDayModel({
  //   meals: 'באן אסאדו',
  //   date: new Date(),
  //   imageUrl: 'testUrl'
  // })
  
  // const mockedWednsdayModel = createDayModel({
  //   meals: 'סלמון',
  //   date: new Date(),
  //   imageUrl: 'testUrl'
  // })

const mockedWeekId = '2024-01';//year:2024, week: 01
const mockedSchedule = 'hls: 13:00, creative: 13:20'

const mockedDays: DayProps[] = [mockedSundayModel];

export const mockedWeek = {
    days: mockedDays,
    weekID: mockedWeekId,
    schedule: mockedSchedule
}