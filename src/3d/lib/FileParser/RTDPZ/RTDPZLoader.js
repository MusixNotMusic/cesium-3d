import { RTDPZFormat } from './RTDPZFormat';
import { loadBlob } from '../loadArrayBuffer';
import { origin } from '@/env.config';
// import picture from '@/images/data/20210723_000003.00.002.001_R1-V.png'

export function loadRTDPZ(url) {
  // url =  url || 'http://' + origin + '/data/20211009_220000.00.111.000_0.002-250_R3'
  url =  url || 'http://' + origin + '/data/20210905_235100.00.111.000_0.002-250_R3'
  return new Promise((resolve, reject) => {
    loadBlob(url, 'arraybuffer').then((blob) => {
      RTDPZFormat.Load(blob).then((instance) => {
         resolve(instance)
      })
    })
  })
}