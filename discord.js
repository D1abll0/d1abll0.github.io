import { DiscordSDK }
from 'https://esm.sh/@discord/embedded-app-sdk';

const CLIENT_ID = '1539377304646586428';

const discordSdk = new DiscordSDK(CLIENT_ID);

await discordSdk.ready();

console.log('Discord SDK ready');

export { discordSdk };