const request = require('request')

module.exports = {
  fetchPage: async (url, proxy) => {
    let results = await new Promise(async (resolve, reject) => {
      try {
        request.get({
          'url': url,
          'method': 'GET',
          'proxy': proxy
        }, (error, response, body) => {
          if (error) {
            console.log(error)
            resolve(false)
          } else {
            if (response.statusCode === 200) {
              resolve(body)
            } else if (response.statusCode === 404) {
              resolve(false)
            }
          }
        })
      } catch (error) {
        reject(error)
      }
    })
    return results
  }
}
