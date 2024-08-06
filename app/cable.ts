import { createCable, Cable } from '@anycable/web';

let _cable: Cable;

export default function cable(): Cable {
  if (_cable) return _cable;

  _cable = createCable({
    logLevel: 'debug',
    protocol: 'actioncable-v1-ext-json', // history and sessions resumeability support
    protocolOptions: {
      historyTimestamp: (Date.now() / 1000 - 300) | 0, // request messages starting from 5min ago (default history ttl)
    },
  });

  return _cable;
}
