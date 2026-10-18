import fs from 'node:fs';
import path from 'node:path';

const uploadedLogo = 'C:/Users/hp/.gemini/antigravity-ide/brain/d7c70fcc-92dd-4af9-965f-b7d842686aa9/.user_uploaded/media_1792183063662.png';
const publicDir = path.resolve('public');

fs.copyFileSync(uploadedLogo, path.join(publicDir, 'logo.png'));
fs.copyFileSync(uploadedLogo, path.join(publicDir, 'rad-logo.png'));

const buf = fs.readFileSync(uploadedLogo);
const b64 = buf.toString('base64');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 382 382" width="382" height="382" role="img" aria-labelledby="logo-title">
  <title id="logo-title">Research Analysis Directorate</title>
  <image href="data:image/png;base64,${b64}" width="382" height="382"/>
</svg>
`;

fs.writeFileSync(path.join(publicDir, 'logo.svg'), svg, 'utf-8');
console.log('Successfully written logo.png, rad-logo.png, and logo.svg');
