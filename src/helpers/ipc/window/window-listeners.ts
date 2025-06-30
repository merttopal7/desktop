import { BrowserWindow, ipcMain, dialog, shell } from "electron";
import {
  WIN_CLOSE_CHANNEL,
  WIN_MAXIMIZE_CHANNEL,
  WIN_MINIMIZE_CHANNEL,
  EXPORT_LICENSE
} from "./window-channels";
import enc from "../enc";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import keydata from "@/keydata";
const writeFileAsync = promisify(fs.writeFile);

export function addWindowEventListeners(mainWindow: BrowserWindow) {
  ipcMain.handle(WIN_MINIMIZE_CHANNEL, () => {
    mainWindow.minimize();
  });
  ipcMain.handle(WIN_MAXIMIZE_CHANNEL, () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.handle(WIN_CLOSE_CHANNEL, () => {
    mainWindow.close();
  });
  ipcMain.handle(EXPORT_LICENSE, async (event, payload) => {
    const selection = [];
    for (const license of (payload?.licenses ?? [])) {
      const selectedLicenses = [];
      //1 5 10 25 50
      const packageLicenses = Object.fromEntries(Object.entries(keydata.types).filter(([key, value]) => value.package == license.type.package));
      for (const _key of license.type.keys) {
        if (_key.type == "number") {
          const usableLicenses = Object.fromEntries(Object.entries(packageLicenses).map(([key, value]: any) => value[_key.key] ? [value[_key.key], key] : false).filter(s => !!s))
          const usableLicenseCount = Object.keys(usableLicenses).map(s => +s).sort((a, b) => b - a)
          const reach = +license.value[_key.key];
          let count = 0;
          while (reach > count) {
            for (const usable of usableLicenseCount) {
              if ((count + usable) <= reach) {
                count = (count + usable);
                selectedLicenses.push(usableLicenses[usable]);
                break;
              }
            }
          }
        } else if (_key.type == "boolean") {
          const choice = license.value[_key.key];
          const findChoice = (Object.entries(packageLicenses).find(([key, value]: any) => value[_key.key] == choice));
          if (findChoice) selectedLicenses.push(`${findChoice[0]}`);
        }
      }
      selection.push(...selectedLicenses);
    }
    const createdLicense = await (new enc(payload.serialKey, selection)).getLicenseKeyList(payload.days ?? 30);
    const utc = new Date().toJSON().slice(0, 10);
    const dateNow = Date.now();
    await writeFileAsync(`output/license/opinnate_${utc}_${dateNow}.opt`, createdLicense.join('\n'));
    shell.showItemInFolder(path.resolve(`output/license/opinnate_${utc}_${dateNow}.opt`));
  });
}
