import {
  Calculator,
  FileText,
  History,
  Moon,
  Plus,
  Settings2,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';
import { useNavigate } from 'react-router';

import { quoteTitle, useHistoryStore } from '@/features/quote';
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatMoney } from '@/shared/lib/format';

import { WIZARD_STEPS } from '@/pages/quote-wizard/steps';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Atalhos de navegação (Ctrl/⌘ + K). */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const quotes = useHistoryStore((s) => s.quotes);
  const { theme, toggle } = useTheme();

  const run = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Ir para"
      description="Busque uma etapa, um orçamento ou uma ação"
    >
      <Command>
        <CommandInput placeholder="Buscar etapa, orçamento ou ação…" />
        <CommandList
          renderEmptyState={() => (
            <p className="py-6 text-center text-sm text-muted">Nada encontrado.</p>
          )}
        >
          <CommandGroup heading="Ações">
            <CommandItem
              textValue="Abrir orçamento em andamento"
              onAction={() => {
                run(() => void navigate('/orcamento'));
              }}
            >
              <Plus /> Orçamento em andamento
            </CommandItem>
            <CommandItem
              textValue="Resumo do orçamento atual"
              onAction={() => {
                run(() => void navigate('/orcamento/resumo'));
              }}
            >
              <FileText /> Resumo do orçamento atual
            </CommandItem>
            <CommandItem
              textValue="Como o preço foi gerado cálculo parâmetros critérios fórmula markup"
              onAction={() => {
                run(() => void navigate('/calculo'));
              }}
            >
              <Calculator /> Como o preço foi gerado
            </CommandItem>
            <CommandItem
              textValue="Orçamentos salvos histórico"
              onAction={() => {
                run(() => void navigate('/orcamentos'));
              }}
            >
              <History /> Orçamentos salvos
            </CommandItem>
            <CommandItem
              textValue="Meu estúdio custos configurações"
              onAction={() => {
                run(() => void navigate('/estudio'));
              }}
            >
              <Settings2 /> Meu estúdio
            </CommandItem>
            <CommandItem
              textValue="Alternar tema claro escuro"
              onAction={() => {
                run(toggle);
              }}
            >
              {theme === 'dark' ? <Sun /> : <Moon />} Tema {theme === 'dark' ? 'claro' : 'escuro'}
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Etapas do orçamento">
            {WIZARD_STEPS.map((step) => (
              <CommandItem
                key={step.id}
                textValue={`${step.label} ${step.title}`}
                onAction={() => {
                  run(() => void navigate(`/orcamento?etapa=${step.id}`));
                }}
              >
                <SlidersHorizontal /> {step.label}
              </CommandItem>
            ))}
          </CommandGroup>
          {quotes.length > 0 && (
            <CommandGroup heading="Orçamentos salvos">
              {quotes.slice(0, 8).map((q) => (
                <CommandItem
                  key={q.id}
                  textValue={`${quoteTitle(q.draft)} ${q.draft.client.name}`}
                  onAction={() => {
                    run(() => void navigate(`/orcamentos/${q.id}`));
                  }}
                >
                  <FileText /> {quoteTitle(q.draft)}
                  <span className="ml-auto text-xs text-muted tabular">
                    {formatMoney(q.priceCents)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
