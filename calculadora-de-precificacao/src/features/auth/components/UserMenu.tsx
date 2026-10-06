import { Button, Dropdown, Label, toast } from '@heroui/react';
import { History, LogIn, LogOut, MessagesSquare, Store, UserRound } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { useAuth, useLogout } from '../hooks/useAuth';

import { UserAvatar } from './UserAvatar';

/** Cabeçalho: botão "Entrar" para visitantes, menu da conta para quem está logado. */
export function UserMenu() {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-10 rounded-full bg-surface px-4"
        onPress={() => {
          void navigate(`/entrar?voltar=${encodeURIComponent(location.pathname)}`);
        }}
      >
        <LogIn className="size-4" />
        <span className="hidden sm:inline">Entrar</span>
      </Button>
    );
  }

  const go = (to: string) => () => void navigate(to);

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={`Conta de ${user.name}`}
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
      >
        <UserAvatar name={user.name} />
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end" className="min-w-56">
        <div className="flex flex-col px-3 pt-3 pb-2">
          <span className="text-sm font-semibold text-foreground">{user.name}</span>
          <span className="truncate text-xs text-muted">{user.email}</span>
        </div>
        <Dropdown.Menu aria-label="Menu da conta">
          <Dropdown.Item id="conta" textValue="Minha conta" onAction={go('/conta')}>
            <UserRound className="size-4" />
            <Label>Minha conta</Label>
          </Dropdown.Item>
          <Dropdown.Item
            id="ofertas"
            textValue="Minhas ofertas"
            onAction={go('/conta?aba=ofertas')}
          >
            <Store className="size-4" />
            <Label>Minhas ofertas</Label>
          </Dropdown.Item>
          <Dropdown.Item id="mensagens" textValue="Mensagens" onAction={go('/mensagens')}>
            <MessagesSquare className="size-4" />
            <Label>Mensagens</Label>
          </Dropdown.Item>
          <Dropdown.Item id="orcamentos" textValue="Orçamentos salvos" onAction={go('/orcamentos')}>
            <History className="size-4" />
            <Label>Orçamentos salvos</Label>
          </Dropdown.Item>
          <Dropdown.Item
            id="sair"
            textValue="Sair"
            variant="danger"
            onAction={() => {
              logout();
              toast.success('Você saiu da conta');
              void navigate('/');
            }}
          >
            <LogOut className="size-4" />
            <Label>Sair</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
