jest.mock('expo-crypto', () => ({
  ...(() => {
    const { createHash } = jest.requireActual('crypto') as {
      createHash: (algorithm: 'sha256') => {
        update: (input: string, encoding: 'utf8') => {
          digest: (encoding: 'hex') => string;
        };
      };
    };

    return {
      CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
      CryptoEncoding: { HEX: 'hex' },
      digestStringAsync: jest.fn(
        async (
          algorithm: string,
          input: string,
          options?: { encoding?: string },
        ) => {
          if (algorithm !== 'SHA-256' || options?.encoding !== 'hex') {
            throw new Error('Unexpected Expo Crypto digest options');
          }

          return createHash('sha256').update(input, 'utf8').digest('hex');
        },
      ),
    };
  })(),
}));

import * as Crypto from 'expo-crypto';
import {
  CURRENT_PASSWORD_HASH_VERSION,
  derivePasswordHash,
} from '../passwordHash';

const mockDigestStringAsync = jest.mocked(Crypto.digestStringAsync);
const saltHex = 'ab'.repeat(16);
const password = 'hunter2secret';
const expectedDigest =
  '16a6379d1959d7ffd43f63c4070f87f854acefcc396cbde149e7b79b1538ec02';

beforeEach(() => mockDigestStringAsync.mockClear());

test('derives the version 2 SHA-256 digest from the domain-separated password input', async () => {
  await expect(derivePasswordHash(password, saltHex)).resolves.toBe(expectedDigest);

  expect(mockDigestStringAsync).toHaveBeenCalledWith(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `opsflare-local-account:v2\0${saltHex}\0${password}`,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
});

test('exports version 2 as the current password hash version', () => {
  expect(CURRENT_PASSWORD_HASH_VERSION).toBe(2);
});
