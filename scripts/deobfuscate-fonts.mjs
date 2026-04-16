import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const rootDir = process.cwd();
const epubPath = path.join(rootDir, "public", "sound_waves-malayalam.epub");
const outDir = path.join(rootDir, "public", "fonts");
const identifier = "urn:uuid:29d919dd-24f5-4384-be78-b447c9dc299b";
const files = [
  "OEBPS/font/Helvetica.TTF",
  "OEBPS/font/Helvetica-Bold.TTF",
  "OEBPS/font/Helvetica-Condensed.TTF",
  "OEBPS/font/HelveticaNeueLTStd-BdCn.OTF",
  "OEBPS/font/HelveticaNeueLTStd-Cn.otf",
  "OEBPS/font/HelveticaNeueLTStd-LtCn.OTF",
  "OEBPS/font/HelveticaNeueLTStd-MdCn.otf",
  "OEBPS/font/K0VKSquareDemi-DemiBold.TTF",
  "OEBPS/font/ML-TKanimozhi.TTF",
  "OEBPS/font/ML-TKanimozhi-Bold.TTF",
  "OEBPS/font/ML-TKanimozhi-Italic.TTF",
  "OEBPS/font/MinionPro-Regular.otf",
  "OEBPS/font/TimesNewRomanPSMT.TTF",
];

fs.mkdirSync(outDir, { recursive: true });

const key = crypto.createHash("sha1").update(identifier, "utf8").digest();

for (const file of files) {
  const fontBuffer = execFileSync("unzip", ["-p", epubPath, file]);
  const decoded = Buffer.from(fontBuffer);
  const limit = Math.min(1040, decoded.length);

  for (let index = 0; index < limit; index += 1) {
    decoded[index] ^= key[index % key.length];
  }

  const outFile = path.join(outDir, path.basename(file));
  fs.writeFileSync(outFile, decoded);
  console.log(`Wrote ${path.relative(rootDir, outFile)}`);
}
