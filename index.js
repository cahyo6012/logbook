require('dotenv').config()
const { CronJob } = require('cron')
const Logbook = require('./lib/Logbook')

console.log('Inisialisasi Cron Job...')

const { USER_SIKKA = '817931780', PASS_SIKKA = '@Ikhsan6012' } = process.env

const isiSak = async() => {
  const logbook = await new Logbook(USER_SIKKA, PASS_SIKKA)
  await logbook.isiSak()
}

const presensi = async() => {
  const logbook = await new Logbook(USER_SIKKA, PASS_SIKKA)
  await logbook.presensi()
}


const jobs = [
  new CronJob('0 3 * * *', isiSak, null, false, 'Asia/Jakarta'),
  new CronJob('1 6 * * *', presensi, null, false, 'Asia/Jakarta'),
  new CronJob('0 17 * * *', presensi, null, false, 'Asia/Jakarta'),
]

console.log('Memulai Cron Job...')
jobs.forEach(job => job.start())