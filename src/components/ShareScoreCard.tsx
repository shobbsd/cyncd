import { Share } from 'react-native';
import { scoreShareText, type ShareCardInput } from '../services/scoreShare';
import { Btn } from './ui';

/** Shares only the public score-card representation through the OS sheet. */
export function ShareScoreCard({ input }: { input: ShareCardInput }) {
  return (
    <Btn
      label="Share cyncd Score"
      variant="secondary"
      block
      onPress={() => {
        void Share.share({ message: scoreShareText(input) });
      }}
    />
  );
}
