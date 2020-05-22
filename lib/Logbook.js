require('dotenv').config()
const request = require('request-promise-native').defaults({
  jar: true,
  rejectUnauthorized: false,
  followAllRedirects: true,
  resolveWithFullResponse: true,
  proxy: process.env.HTTP_PROXY || null,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'
  },
})

class Logbook {
  constructor(username, password) {
    this.BASE_URL = 'https://logbook.pajak.go.id/'
    this._username = username
    this._password = password
    return this.login()
  }

  async login() {
    console.log('Mencoba Login Logbook...')
    const token = await this.getToken()
    
    const url = this.BASE_URL + 'login/validate'
    const res = await request.post(url, { form: {
      token, nip: this._username, password: this._password
    }})

    if('refresh' in (res.headers|| {}) || this.checkLogin(res.body)) {
      console.log('Login Berhasil...')
      this.logged_in = true
    } else {
      console.log('Login Gagal. Username Atau Password Salah...')
      this.logged_in = false
      process.exit()
    }
    return this
  }

  async getToken(withData = false) {
    const url = this.BASE_URL + 'Presensi'
    const res = await request.get(url)
    const pToken = /name="token" value="(?<token>\w+)"/
    const token = res.body.match(pToken).groups.token
    if (withData) {
      const pData = /name="data" value="(?<data>\d+)"/
      const data = res.body.match(pData).groups.data
      return { token, data }
    } else {
      return token
    }
  }

  checkLogin(body = '') {
    const pattern = /Login sebagai/
    return !!body.match(pattern)
  }

  async presensi() {
    console.log('\nMelakukan Presensi...')
    const url = this.BASE_URL + 'Presensi'
    const form = await this.getToken(true)

    const res = await request.post(url + '/absen', { form })
    if(!res.headers.refresh.includes('sukses')) {
      console.log('Terjadi Masalah Saat Melakukan Presensi...')
      process.exit()
    }
    console.log('Presensi Berhasil...')
    return this
  }

  async isiSak() {
    console.log('\nMengisi SAK...')
    const url = this.BASE_URL + 'SelfAssessmentKesehatan'
    
    const form = this.cekConfig()
    form.token = await this.getToken()
    const res = await request.post(url + '/add', { form })
    if(res.headers.refresh.match('form')) {
      console.log('Pengisian SAK Gagal...')
      process.exit()
    }
    console.log('Pengisian SAK Berhasil...')
  }

  cekConfig() {
    const config = require('../config.json')
    const kota = require('../kota.json')
    const errors = []
    const data = {}

    console.log('Mengecek Konfigurasi...')
    if(config.pernyataan.value != 1) errors.push('pernyataan.value harus 1')
    for(let key in config) {
      if(key == 'kd_kota') {
        let error = true
        for(let k of kota) if(k.value == config[key].value) error = false 
        if(error) errors.push(`${config[key].value} tidak terdapat pada list kota.json`)
      }
      if(config[key].required == true && !config[key].value) {
        errors.push(`${key}.value tidak boleh kosong...`)
      } else {
        data[key] = config[key].value
      }
    }
    if(errors.length) {
      console.log(errors)
      console.log('Terdapat Error Pada Konfigurasi...')
      console.log('Silahkan Cek Kembali file config.json') 
      process.exit()
    }
    console.log('Tidak Ada Error Pada Konfigurasi...')
    data.accuracy = Math.round(Math.random() * 1000)
    return data
  }
}

module.exports = Logbook