const fetch = require('node-fetch');
const states = require('us-state-converter');


const geocode = async(location) => {
  const [city, state] = location.split(', ')
  // const [city, state] = ['hus', 'te']
  const state_abbr = states.abbr(state)
  const response = await fetch(`http://dev.virtualearth.net/REST/v1/Locations/US/${state_abbr}/${city}?o=json&key=${process.env.MAP_KEY}`)
  const res_body = await response.json()
  console.log(response)
  const geometry = res_body.resourceSets[0].resources[0].point
  console.log(geometry)
  return geometry;
}

module.exports = geocode;