import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const rootDir = process.cwd();
const epubPath = path.join(rootDir, "public", "physics.epub");
const outDir = path.join(rootDir, "public", "fonts");
const identifier = "urn:uuid:29d919dd-24f5-4384-be78-b447c9dc299b";
const files = [
  { source: "OEBPS/font/Helvetica-Bold.TTF", target: "Helvetica-Bold.TTF" },
  { source: "OEBPS/font/Helvetica-Condensed.TTF", target: "Helvetica-Condensed.TTF" },
  { source: "OEBPS/font/HelveticaNeueLTStd-BdCn.OTF", target: "HelveticaNeueLTStd-BdCn.OTF" },
  { source: "OEBPS/font/HelveticaNeueLTStd-Cn.otf", target: "HelveticaNeueLTStd-Cn.otf" },
  { source: "OEBPS/font/HelveticaNeueLTStd-LtCn.OTF", target: "HelveticaNeueLTStd-LtCn.OTF" },
  { source: "OEBPS/font/K0VKSquareDemi-DemiBold.TTF", target: "K0VKSquareDemi-DemiBold.TTF" },
  { source: "OEBPS/font/MinionPro-Regular.otf", target: "MinionPro-Regular.otf" },
  { source: "OEBPS/font/ML-TKanimozhi-Bold.TTF", target: "ML-TKanimozhi-Bold.TTF" },
  { source: "OEBPS/font/ML-TKanimozhi-Italic.TTF", target: "ML-TKanimozhi-Italic.TTF" },
  { source: "OEBPS/font/ML-TKanimozhi.TTF", target: "ML-TKanimozhi.TTF" },
  { source: "OEBPS/font/SymbolMT.TTF", target: "SymbolMT.TTF" },
  { source: "OEBPS/font/TimesNewRomanPSMT.TTF", target: "TimesNewRomanPSMT.TTF" },
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
