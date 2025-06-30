import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LangToggle from "@/components/LangToggle";
import Footer from "@/components/template/Footer";
import InitialIcons from "@/components/template/InitialIcons";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import options from "@/keydata/index"
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"

import { Toggle } from "@/components/ui/toggle"
import {
  exportLicense
} from "@/helpers/window_helpers";


export default function HomePage() {
  const { t } = useTranslation();
  const [licenses, setLicenses] = useState<any>([]);
  const [serialKey, setSerialKey] = useState<any>("");
  const [days, setDays] = useState(0);
  const [packages, setPackages] = useState<any>([]);
  const [pkg, setPkg] = useState<any>({});
  const [dform, setDform] = useState<any>({});

  const setValues = (all = false) => {
    const packageMap: any = {};
    const formDefaultValues: any = {}

    Object.values(options.types).forEach((item: any) => {
      const { package: pkg, ...rest } = item;
      if (!packageMap[pkg]) {
        packageMap[pkg] = new Set();
      }
      Object.keys(rest).forEach(key => {
        formDefaultValues[key] = typeof rest[key] == "number" ? 0 : true;
        packageMap[pkg].add(JSON.stringify({
          key,
          type: typeof rest[key]
        }))
      });
    });

    setDform(formDefaultValues)
    if (all) {
      // Sonuçları istenen formatta oluştur
      const result = Object.entries(packageMap).map(([pkg, keys]: any) => ({
        package: Number(pkg),
        keys: Array.from(keys).map((kk: any) => JSON.parse(kk))
      }));

      return setPackages(result);
    }
  }
  useEffect(() => {
    setValues(true);
  }, [])

  const submitLicense = () => {
    if (!pkg?.package) return;
    const submitData = {
      id: Date.now(),
      type: pkg,
      value: dform
    }
    const newLicenses: any = [...licenses]
    if (pkg?.package == 4 && newLicenses.find((license: any) => license.type?.package == 4)) { }
    else if (pkg?.package == 4) newLicenses.unshift(submitData)
    else newLicenses.push(submitData)
    setLicenses(newLicenses)
    setValues(true)
  }
  const showValue = (val: any) => {
    if (typeof val == 'boolean') return val ? "True" : "False";
    return val;
  }
  const removeLicense = (id: any) => {
    setLicenses(licenses.filter((license: any) => license.id != id));
  }
  const exportAppLicense = () => {
    exportLicense({
      serialKey,
      days,
      licenses
    })
  }
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex w-full gap-2">
          <div className="w-full">
            <Label htmlFor="serial">Serial Key</Label>
            <Input type="text" id="serial" placeholder="Serial Key" className="my-2" onInput={(e) => setSerialKey(e.target?.value)} value={serialKey} />
          </div>
          <div className="w-full">
            <Label htmlFor="days">Days</Label>
            <Input type="number" id="days" placeholder="Days" className="my-2" onInput={(e) => setDays(e.target?.value)} value={days} />
          </div>
        </div>
        <div className="w-full h-screen grid grid-cols-2">
          <div className="p-2">
            <div className="flex gap-1">
              {packages.map(_package => (
                <Button key={_package?.package} onClick={() => setPkg(_package)} variant={pkg.package == _package.package ? "destructive" : ""} className="p-3">{options.packageNames[_package?.package]}</Button>
              ))}
            </div>
            <div className="py-2 h-96">
              {((packages.find(_pkg => _pkg.package == pkg?.package) ?? { keys: [] })?.keys ?? []).map(_key => (
                <div key={_key?.key} className="w-[50%] inline-block p-1">
                  {_key.type == 'boolean' && (
                    <div>
                      <Label htmlFor={_key.key}>{_key.key.toUpperCase()}</Label>
                      <Switch id={_key.key} placeholder={_key.key.toUpperCase()} className="my-2"
                        checked={dform[_key.key]}
                        onClick={() => setDform({ ...dform, [_key.key]: !dform[_key.key] })}
                      />
                    </div>
                  )}
                  {(_key.type == 'number' || _key.type == 'string') && (
                    <div>
                      <Label htmlFor={_key.key}>{_key.key.toUpperCase()}</Label>
                      <Input id={_key.key} type="number" placeholder={_key.key.toUpperCase()} value={dform[_key.key]} className="my-2" onInput={(e) => setDform({ ...dform, [_key.key]: e.target.value })} />
                    </div>
                  )}
                </div>
              ))}
              <Button className="w-full" onClick={submitLicense}>Submit</Button>
            </div>
          </div>
          <div className="p-2">
            <h2>Licenses</h2>
            <div className="rounded-lg border p-1 flex-col h-86 overflow-y-scroll">
              {licenses.map((license, index) => (
                <div key={index} className="rounded-lg border p-2 mb-2 flex justify-between items-center">
                  <div>
                    <div>#{index + 1} {options.packageNames[license?.type?.package]}</div>
                    {(license?.type?.keys ?? []).map(attr => (
                      <div key={attr.key}> {attr.key.toUpperCase()}: {showValue(license?.value[attr.key] ?? "-")}</div>
                    ))}
                  </div>
                  <div>
                    <Button variant="destructive" onClick={() => removeLicense(license?.id)}>X</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full my-2" onClick={exportAppLicense}>Export</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
