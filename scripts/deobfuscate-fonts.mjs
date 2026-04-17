import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const rootDir = process.cwd();
const epubPath = path.join(rootDir, "public", "hindi.epub");
const outDir = path.join(rootDir, "public", "fonts");
const identifier = "urn:uuid:29d919dd-24f5-4384-be78-b447c9dc299b";
const files = [
  { source: "OEBPS/font/AGaramondPro-Bold.otf", target: "AGaramondPro-Bold.otf" },
  { source: "OEBPS/font/ArialMT.ttf", target: "ArialMT.ttf" },
  { source: "OEBPS/font/DV-TTSurekh-Bold.TTF", target: "DV-TTSurekh-Bold.TTF" },
  { source: "OEBPS/font/DVTTSurekhNormal.TTF", target: "DVTTSurekhNormal.TTF" },
  { source: "OEBPS/font/Helvetica.ttf", target: "Helvetica.TTF" },
  { source: "OEBPS/font/Helvetica-Bold.ttf", target: "Helvetica-Bold.TTF" },
  { source: "OEBPS/font/HelveticaNeueLTStd-BdCn.OTF", target: "HelveticaNeueLTStd-BdCn.OTF" },
  { source: "OEBPS/font/ML-TKanimozhi.ttf", target: "ML-TKanimozhi.TTF" },
  { source: "OEBPS/font/ML-TKanimozhi-Bold.ttf", target: "ML-TKanimozhi-Bold.TTF" },
  { source: "OEBPS/font/TimesNewRomanPSMT.ttf", target: "TimesNewRomanPSMT.TTF" },
  { source: "OEBPS/font/Wingdings-Regular.ttf", target: "Wingdings-Regular.ttf" },
];

fs.mkdirSync(outDir, { recursive: true });

const key = crypto.createHash("sha1").update(identifier, "utf8").digest();

for (const { source, target } of files) {
  const fontBuffer = execFileSync("unzip", ["-p", epubPath, source]);
  const decoded = Buffer.from(fontBuffer);
  const limit = Math.min(1040, decoded.length);

  for (let index = 0; index < limit; index += 1) {
    decoded[index] ^= key[index % key.length];
  }

  const outFile = path.join(outDir, target);
  fs.writeFileSync(outFile, decoded);
  console.log(`Wrote ${path.relative(rootDir, outFile)}`);
}
