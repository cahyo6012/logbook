require('dotenv').config()
const { google } = require('googleapis')

const { GOOGLE_API_KEY } = process.env

const checkHoliday = async () => {
  google.options({ auth: GOOGLE_API_KEY })
  const calendar = google.calendar('v3')
  const res = await calendar.events.list({
    calendarId: 'id.indonesian#holiday@group.v.calendar.google.com'
  });
  const now = new Date()
  const d = now.getDate()
  const m = now.getMonth()
  const y = now.getFullYear()

  return !!res.data.items.find(item => new Date(item.start.date).getTime() === new Date(y,m,d).getTime())
}

module.exports = { checkHoliday }