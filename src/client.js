import cliSettings from './settings.js'
import W3Client from '@web3-storage/w3up-client'
import Conf from 'conf'

/**
 * @param {string} [profile] - The name of the profile to load settings for.
 */
export function getProfileSettings (profile = 'main') {
  const profileSettings = new Conf({
    projectName: 'w3up',
    projectSuffix: '',
    configName: profile,
    fileExtension: 'json'
  })

  return profileSettings
}

export function getClient (profile = 'main') {
  const settings = getProfileSettings(profile)

  const client = new W3Client({
    // @ts-ignore
    serviceDID: cliSettings.W3_STORE_DID,
    serviceURL: cliSettings.SERVICE_URL,
    // @ts-ignore
    accessDID: cliSettings.ACCESS_DID,
    accessURL: cliSettings.ACCESS_URL,
    // @ts-ignore
    settings: settings.store
  })

  return client
}

/**
 * @param {W3Client} client
 * @param {string} profile
 */
export function saveSettings (client, profile = 'main') {
  const conf = getProfileSettings(profile)
  // @ts-expect-error
  conf.set(client.settings)
}

/**
 * @param {W3Client} client
 * @param {string} profile
 */
export function clearSettings (client, profile = 'main') {
  const conf = getProfileSettings(profile)
  // @ts-expect-error
  client.settings = {}
  conf.clear()
}
