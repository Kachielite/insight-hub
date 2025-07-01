import { formatMessage, capitalize } from '@/utils/helpers';

export const App = () => {
  const message = 'hello from client!';
  const formattedMessage = formatMessage(message);
  const capitalizedMessage = capitalize(formattedMessage);

  console.log(capitalizedMessage);
  return capitalizedMessage;
};
