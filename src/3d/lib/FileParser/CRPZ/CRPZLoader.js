import { CRPZFormat } from './CRPZFormat';
import { loadBlob } from '../loadArrayBuffer';
import { origin } from '@/env.config';
// import picture from '@/images/data/20210723_000003.00.002.001_R1-V.png'

export function loadCRPZ(url) {
  url =  url || 'http://' + origin + '/data/20200823_002200.00.109.000_0.001_R1'
  return new Promise((resolve, reject) => {
    loadBlob(url, 'arraybuffer').then((blob) => {
        CRPZFormat.Load(blob).then((instance) => {
         resolve(instance)
      })
    })
  })
}