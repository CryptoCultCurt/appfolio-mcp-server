"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@pipedream/sdk");
// This code runs on your server
const client = new sdk_1.PipedreamClient({
    projectEnvironment: "production",
    clientId: process.env.PIPEDREAM_CLIENT_ID,
    clientSecret: process.env.PIPEDREAM_CLIENT_SECRET,
    projectId: process.env.PIPEDREAM_PROJECT_ID
});
async function main() {
    // Create a token for a specific user
    const { token, expiresAt, connectLinkUrl } = await client.tokens.create({
        externalUserId: "2dafb3f8-8d84-4fae-bfd9-328c9b20ef11", // Replace with your user's ID
    });
}
main();
