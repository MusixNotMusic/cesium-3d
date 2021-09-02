export function loadBlob(url, responseType) {
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