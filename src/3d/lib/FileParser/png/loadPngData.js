import RadarNetFormat from './RadarNetFormat'
import { origin } from '@/env.config'
// import picture from '@/images/data/20210723_000003.00.002.001_R1-V.png'

export function loadPng() {
  let url = 'http://' + origin + '/data/20210826_221804.00.002.001_R3-R.png'
  return new Promise((resolve, reject) => {
    loadBlob(url, 'blob').then((blob) => {
      RadarNetFormat.Load(blob).then((bufferData) => {
        resolve(bufferData)
      })
    })
  })
}

function loadBlob(url, responseType) {
  responseType = responseType || 'blob'
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)

    xhr.responseType = responseType

    // Process the response when the request is ready.
    xhr.onload = function (e) {
      if (this.status == 200) {
        // Create a binary string from the returned data, then encode it as a data URL.
        switch (responseType) {
          case 'arraybuffer':
            var uInt8Array = new Uint8Array(this.response)
            resolve(uInt8Array)
            break
          case 'blob':
            resolve(this.response)
            break
          default:
            throw new DeveloperError('Unhandled responseType: ' + responseType)
        }
      } else {
        reject(e.error)
      }
    }

    xhr.send()
  })
}
