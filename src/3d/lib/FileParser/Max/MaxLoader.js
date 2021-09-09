import { MaxFormat } from './MaxFormat';
import { loadBlob } from '../loadArrayBuffer';
import { origin } from '@/env.config';
// import picture from '@/images/data/20210723_000003.00.002.001_R1-V.png'

export function loadMax(url) {
  url =  url || 'http://' + origin + '/data/20210826_221804.00.011.001_0.50-0.00-0_R3'
  return new Promise((resolve, reject) => {
    loadBlob(url, 'arraybuffer').then((blob) => {
        MaxFormat.Load(blob).then((instance) => {
         resolve(instance)
      })
    })
  })
}