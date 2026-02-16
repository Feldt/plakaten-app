import { CampaignId, TaskClaimId } from './database';

export type AuthRouteParams = {
  '(auth)/welcome': undefined;
  '(auth)/login': undefined;
  '(auth)/register-party': undefined;
  '(auth)/register-worker': undefined;
  '(auth)/verify-otp': { phone: string; name?: string; email?: string; flow: 'register-worker' | 'login' };
  '(auth)/pending-approval': undefined;
};

export type PartyRouteParams = {
  '(party)/index': undefined;
  '(party)/workers': undefined;
  '(party)/settings': undefined;
  '(party)/campaigns/index': undefined;
  '(party)/campaigns/create': undefined;
  '(party)/campaigns/[id]/index': { id: CampaignId };
  '(party)/campaigns/[id]/workers': { id: CampaignId };
  '(party)/campaigns/[id]/log': { id: CampaignId };
  '(party)/campaigns/[id]/financials': { id: CampaignId };
};

export type WorkerRouteParams = {
  '(worker)/index': undefined;
  '(worker)/earnings': undefined;
  '(worker)/rules': undefined;
  '(worker)/profile': undefined;
  '(worker)/tasks/index': undefined;
  '(worker)/tasks/[id]/index': { id: TaskClaimId };
  '(worker)/tasks/[id]/hanging': { id: TaskClaimId };
};

export type AdminRouteParams = {
  '(admin)/index': undefined;
};

export type AppRouteParams = AuthRouteParams & PartyRouteParams & WorkerRouteParams & AdminRouteParams;
