require('dotenv').config()
const { CronJob } = require('cron')
const { checkHoliday } = require('./lib/googleapis')
const Logbook = require('./lib/Logbook')

const { USER_SIKKA, PASS_SIKKA } = process.env


const delay = (h = 1, cb, title = 'Operasi') => {
  return function(){
    const randomDelay = Math.round(Math.random() * 1000 * 60 * 60 * h)
    const actualStartTime = new Date(new Date(this.lastExecution).getTime() + randomDelay).toLocaleDateString('id', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
    console.log(title, 'Akan Dimulai Pada', actualStartTime)
    setTimeout(cb, randomDelay)
  }
}

const isiSak = async () => {
  const logbook = await new Logbook(USER_SIKKA, PASS_SIKKA)
  await logbook.isiSak()
}

const presensi = async () => {
  if(await checkHoliday()) {
    console.log('Hari Libur...')
    console.log('Presensi Dibatalkan....')
    return false
  }
  const logbook = await new Logbook(USER_SIKKA, PASS_SIKKA)
  await logbook.presensi()
}

(async function() {
  console.log('Melakukan Pengecekan Username dan Password...')
  const logbook = await new Logbook(USER_SIKKA, PASS_SIKKA)
  if(!logbook.logged_in) {
    console.log('Username atau Password Tidak Valid...')
    process.exit()
  }
  console.log('Username atau Password Valid...')
  console.log('\nInisialisasi Cron Job...')
  
  const jobs = [
    new CronJob('0 3 * * *', delay(3, isiSak, '\nPengisian SAK'), null, false, 'Asia/Jakarta'),
    new CronJob('0 6 * * *', delay(1, presensi, '\nPresensi Masuk'), null, false, 'Asia/Jakarta'),
    new CronJob('0 16 * * *', delay(2, presensi, '\nPresensi Pulang'), null, false, 'Asia/Jakarta'),
  ]
  
  console.log('Memulai Cron Job...')
  jobs.forEach(job => job.start())
})()
