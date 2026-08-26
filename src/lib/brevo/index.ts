export { isBrevoConfigured, getBrevoClient, getBrevoConfig } from "./client";
export {
  listEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  type UpsertEmailTemplateInput,
} from "./templates";
export {
  listEmailCampaigns,
  createAndDispatchCampaign,
  type CreateCampaignInput,
} from "./campaigns";
export { sendTransactionalEmail, type SendTransactionalInput } from "./send";
export { getBrevoConnectionStatus } from "./status";
export { listBrevoContacts, getBrevoContactCount } from "./contacts";
export { listBrevoLists, type BrevoList } from "./lists";
