export { QuoteSummary } from './components/QuoteSummary';
export { ProposalDialog } from './components/ProposalDialog';
export { PricingBreakdown } from './components/PricingBreakdown';
export type { SavedQuote } from './types';
export {
  useImportLegacyQuotes,
  useRemoveQuote,
  useSavedQuote,
  useSavedQuotes,
  useSaveQuote,
} from './hooks/useSavedQuotes';
export { describeLocation, quoteTitle, clientLabel } from './utils/describe';
