import { useNavigate } from 'react-router';

import { EmptyScene } from '@/shared/components/layout/EmptyScene';

export function NotFoundPage({ message = 'Essa página não existe.' }: { message?: string }) {
  const navigate = useNavigate();
  return (
    <EmptyScene
      as="h1"
      title="Corta!"
      message={message}
      action={{
        label: 'Voltar ao início',
        onPress: () => {
          void navigate('/');
        },
      }}
    />
  );
}
