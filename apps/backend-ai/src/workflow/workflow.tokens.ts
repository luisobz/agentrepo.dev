import type { ContactWorkflowPayload, UseCase } from '@agentrepo/application';

export type ContactWorkflowUseCase = UseCase<ContactWorkflowPayload, void>;

export const CONTACT_WORKFLOW_USE_CASE = Symbol('CONTACT_WORKFLOW_USE_CASE');
