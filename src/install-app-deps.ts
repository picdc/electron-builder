#! /usr/bin/env node

import { computeDefaultAppDirectory, getElectronVersion, use } from "./util/util"
import { printErrorAndExit } from "./util/promise"
import * as path from "path"
import BluebirdPromise from "bluebird-lst-c"
import { DevMetadata } from "./metadata"
import yargs from "yargs"
import { readPackageJson } from "./util/readPackageJson"
import { installDependencies, computeExtraArgs } from "./yarn"

const args: any = yargs
  .option("arch", {
    choices: ["ia32", "x64", "all"],
  }).argv

const projectDir = process.cwd()
const devPackageFile = path.join(projectDir, "package.json")

async function main() {
  const devMetadata: DevMetadata = await readPackageJson(devPackageFile)
  const results: Array<string> = await BluebirdPromise.all([
    computeDefaultAppDirectory(projectDir, use(devMetadata.directories, it => it!.app)),
    getElectronVersion(devMetadata, devPackageFile)
  ])

  if (results[0] === projectDir) {
    throw new Error("install-app-deps is only useful for two package.json structure")
  }

  await installDependencies(results[0], results[1], args.arch, computeExtraArgs(devMetadata.build))
}

main()
  .catch(printErrorAndExit)