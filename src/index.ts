import { readdir, stat } from "fs/promises"
import { join } from "path"
import { cwd } from "process"

import { readFile, writeFile } from "./utils/fileSystem"

const DATA_DIR = join(cwd(), "script")
const map = new Map()

;(async () => {
  await processFiles(DATA_DIR)
  await writeFile("./hi.json", JSON.stringify(Object.fromEntries(map), null, 2))
  console.log("success")
})()

async function processFiles(directoryPath: string) {
  try {
    const files = await readdir(directoryPath)

    for (const file of files) {
      const filePath = join(directoryPath, file)
      const fileStats = await stat(filePath)

      if (fileStats.isDirectory()) {
        await processFiles(filePath)
      } else {
        const data = (await readFile(filePath)).toString()

        const match = data.match(/ScriptLib\.(\w+)\(.*\)/g)
        if (!match) continue

        match.forEach((matchData) => {
          if (map.has(matchData)) return

          const functionName = matchData.match(/ScriptLib\.(\w+)\(/)[1]
          map.set(functionName, matchData)
        })
      }
    }
  } catch (error) {
    console.error("Error reading files:", error)
  }
}
