const axios = require('axios')

module.exports = {
  fetchPage: async (url) => {
    let results = await new Promise(async (resolve, reject) => {
      try {
        const result = await axios.get(url)
        resolve(result.data)
      } catch (error) {
        reject(error)
      }
    })
    return results
  },
  postData: async (url, data) => {
    let results = await new Promise(async (resolve, reject) => {
      try {
        let res = await axios.post(url, data)
        resolve(res.data)
      } catch (error) {
        reject(error)
      }
    })
    return results
  }
}
