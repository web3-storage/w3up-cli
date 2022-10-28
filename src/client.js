import W3Client from '@web3-storage/w3up-client'
import Conf from 'conf'

import { default as cliSettings } from './settings.js'

export function getProfileSettings(profile = 'main') {
  const profileSettings = new Conf({
    projectName: 'w3up',
    projectSuffix: '',
    configName: profile,
    fileExtension: 'json',
  })

  return profileSettings
}

export function getClient(profile = 'main') {
  const settings = getProfileSettings(profile)
  // console.log(settings.path)
  const client = new W3Client({
    // @ts-ignore
    serviceDID: cliSettings.W3_STORE_DID,
    serviceURL: cliSettings.SERVICE_URL,
    // @ts-ignore
    accessDID: cliSettings.ACCESS_DID,
    accessURL: cliSettings.ACCESS_URL,
    // @ts-ignore
    settings: settings.store,
  })

  return client
}

/**
 * @param {W3Client} client
 * @param {string} profile
 */
export function saveSettings(client, profile = 'main') {
  const conf = getProfileSettings(profile)
  // @ts-ignore
  conf.set(client.settings)
}
