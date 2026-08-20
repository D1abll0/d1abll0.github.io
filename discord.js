import { DiscordSDK } from './discord-sdk.js';

const CLIENT_ID = '1539377304646586428';
const discordSdk = new DiscordSDK(CLIENT_ID);
await discordSdk.ready();
console.log('Discord SDK ready');
export { discordSdk };
