import { Button, Modal, Spinner, toast } from '@heroui/react';
import { FileDown } from 'lucide-react';
import { useState } from 'react';

import { StudioIdentityForm } from '@/features/business-profile';
import { useProfileStore, type PricingResult, type QuoteDraft } from '@/features/pricing';
import { SwitchField } from '@/shared/components/form/SwitchField';
import { TextInput } from '@/shared/components/form/TextInput';

import { downloadProposal } from '../export/download-proposal';

interface ProposalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  draft: QuoteDraft;
  result: PricingResult;
}

export function ProposalDialog({ isOpen, onOpenChange, draft, result }: ProposalDialogProps) {
  const identity = useProfileStore((s) => s.profile);
  const [includeBreakdown, setIncludeBreakdown] = useState(false);
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const missingName = !identity.businessName.trim() && !identity.ownerName.trim();

  const generate = async () => {
    setIsGenerating(true);
    try {
      await downloadProposal({ draft, identity, result, options: { includeBreakdown, notes } });
      toast.success('Proposta baixada', { description: 'O PDF está na sua pasta de downloads.' });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.danger('Não foi possível gerar o PDF', {
        description: 'Tente de novo. Se usar uma logo, confira se é PNG ou JPG.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container size="lg" scroll="inside">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Gerar proposta em PDF</Modal.Heading>
            <p className="text-sm text-muted">
              Revise como a proposta vai ser assinada. Esses dados ficam salvos no seu estúdio.
            </p>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-6">
            <StudioIdentityForm compact />
            <div className="flex flex-col gap-4 border-t border-border pt-5">
              <SwitchField
                label="Anexar memória de cálculo"
                description="Uma página extra com a composição do preço. Bom para clientes que pedem transparência."
                isSelected={includeBreakdown}
                onChange={setIncludeBreakdown}
              />
              <TextInput
                label="Observação para o cliente"
                placeholder="Ex.: Inclui 2 rodadas de revisão. Prazo de entrega: 15 dias úteis."
                value={notes}
                onChange={setNotes}
                multiline
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="tertiary"
              onPress={() => {
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              isDisabled={missingName || isGenerating}
              onPress={() => {
                void generate();
              }}
            >
              {isGenerating ? (
                <Spinner size="sm" color="current" />
              ) : (
                <FileDown className="size-4" />
              )}
              {missingName ? 'Informe o nome do estúdio' : 'Baixar proposta'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
