#!/usr/bin/env node
import { execSync } from "node:child_process";

const BUCKET = "bigolbuffalo.com";
const DISTRIBUTION_ID = "E2LU60HYKV3X5S";
const SITE_URL = "https://bigolbuffalo.com/";

function step(label, cmd) {
  console.log(`\n--- ${label} ---`);
  console.log(`$ ${cmd}\n`);
  execSync(cmd, { stdio: "inherit" });
}

step("build", "npx eleventy");
step("sync", `aws s3 sync _site/ s3://${BUCKET}/ --delete`);
step(
  "invalidate CloudFront cache",
  `aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*" --query "Invalidation.{Id:Id,Status:Status}" --output table`
);

console.log(`\nDeployed. ${SITE_URL}`);
console.log("CloudFront invalidation takes 1-5 min to fully propagate.");
