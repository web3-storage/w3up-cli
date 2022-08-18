#!/usr/bin/env node

import Z from 'zod'
import * as Soly from 'soly'
import { script } from 'subprogram'
import path from 'path'
import { pathToFileURL } from 'url'
import { parseLink } from '@ucanto/server'
import fs from 'fs'

import {
  resetSettings,
  exportSettings,
  importSettings,
} from './commands/settings.js'

import { generateCar, writeFileLocally } from './commands/generateCar.js'
import { run as carInfo } from './commands/carInfo.js'

import client from './client.js'

const cli = Soly.createCLI('w3-cli')

cli

  .command('upload', (input) => {
    const [carPath] = input.positionals([Soly.path()])
    return async () => {
      if (!carPath.value) {
        console.log('You must provide the path to a car file to upload.')
      }
      //check to make sure its a CAR here.
      const buffer = fs.readFileSync(resolveURL(carPath.value))
      const response = await client.upload(buffer)
      console.log(response)
    }
  })
  .command('car-to-dot', (input) => {
    const [carPath] = input.positionals([Soly.path()])
    return async () => {
      if (!carPath.value) {
        console.log('You must provide the path to a car to examine.')
      }

      const buffer = fs.readFileSync(resolveURL(carPath.value))
      const info = await carInfo(buffer)
      console.log(info)
    }
  })
  .command('generate-car', (input) => {
    const [carPath, outPath] = input.positionals([
      Soly.path().optional(),
      Soly.string().optional(),
    ])

    return async () => {
      if (!carPath.value) {
        console.log('You must provide a path to generate a car from.')
        return
      }

      var data = await generateCar(carPath.value)
      writeFileLocally(data, outPath.value)
    }
  })

  .command('reset-settings', () => async () => resetSettings({ settings }))
  .command('export-settings', () => async () => exportSettings({ settings }))
  .command('import-settings', (input) => {
    const [data] = input.positionals(Soly.string().optional(), 0)
    return async () => importSettings({ settings, fileName: data.value || '' })
  })
  .command('insights', (input) => {
    const [data] = input.positionals(Soly.string().optional(), 0)
    return async () => {
      const cid = data?.value || ''
      if (cid.length > 0) {
        const response = await client.insights(cid)
        console.log('response', response)
      } else {
        console.log('You must provide a CID to get insights for.')
      }
    }
  })
  .command('insights-ws', (input) => {
    const [data] = input.positionals(Soly.string().optional(), 0)
    return async () => {
      const cid = data?.value || ''
      if (cid.length > 0) {
        const response = await client.insightsWS(cid)
        console.log('response', response)
      } else {
        console.log('You must provide a CID to get insights for.')
      }
    }
  })

export const main = async () => cli.parse(process.argv)

/**
 *
 * @param {string} relativeFilepath
 * @returns {URL}
 */

const resolveURL = (relativeFilepath) =>
  pathToFileURL(path.resolve(process.cwd(), relativeFilepath))

script({ ...import.meta, main, dotenv: true })
