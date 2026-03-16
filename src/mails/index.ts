import { sendEmail } from "./send-mail";
import { ApprovePayableTemplate } from "./templates/approve-payable";
import { ApprovedManyNotificationTemplate } from "./templates/approved-many-notification";
import { ApprovedNotificationTemplate } from "./templates/approved-notification";
import { completeEmployeeRegistration } from "./templates/complete-employee-registration";
import { exportDataTemplate } from "./templates/export-data-template";
import { forgotPasswordTemplate } from "./templates/forgot-password";
import { RejectedManyNotificationTemplate } from "./templates/rejected-many-notification";
import { RejectedNotificationTemplate } from "./templates/rejected-notification";
import { shareBudgetPlanTemplate } from "./templates/share-budget-plan-template";
import { welcomeTemplate } from "./templates/welcome-template";

export async function sendEmailCompleteEmployeeRegistration(
  id: number,
  email: string,
): Promise<void> {
  const APP_FRONT_URL = process.env.FRONT_APP_URL;

  const url = `${APP_FRONT_URL}/colaboradores/cadastro-completo?collaboratorId=${id}`;

  const html = completeEmployeeRegistration(url);

  await sendEmail(email, "Informações: Colaboradores ABC", html);
}

export async function sendEmailWelcomeUser(
  email: string,
  token: string,
): Promise<void> {
  const APP_FRONT_URL = process.env.FRONT_APP_URL;

  const forgotLink = `${APP_FRONT_URL}/nova-senha?token=${token}`;

  const html = welcomeTemplate(forgotLink);

  await sendEmail(email, "ABC | Seja Bem-vindo ao ERP!", html);
}

export async function sendEmailForgotPassword(
  email: string,
  token: string,
): Promise<void> {
  const APP_FRONT_URL = process.env.FRONT_APP_URL;

  const forgotLink = `${APP_FRONT_URL}/nova-senha?token=${token}`;

  const html = forgotPasswordTemplate(forgotLink);

  await sendEmail(email, "ABC | Pedido de Redefinição de Senha", html);
}

export async function sendEmailCsvBudgetPlan(
  email: string,
  fileName: string,
): Promise<void> {
  const HOST_APP_URL = process.env.HOST_APP_URL;

  const linkDownload = `${HOST_APP_URL}/budget-plans/download-file/${fileName}`;

  const html = exportDataTemplate(linkDownload);

  await sendEmail(email, "ABC | O seu download está disponível", html);
}

export async function sendEmailShareBudgetPlan({
  id,
  username,
  email,
  name,
  password,
}: {
  id: number;
  username: string;
  email: string;
  name: string;
  password: string;
}): Promise<void> {
  const APP_FRONT_URL = process.env.FRONT_APP_URL;
  const page = id
    ? "plano-orcamentario-compartilhado"
    : "consolidado-compartilhado";

  const link = `${APP_FRONT_URL}/${page}?budgetPlanId=${id}&name=${name}&username=${username}`;

  const html = shareBudgetPlanTemplate({
    name,
    password,
    link,
  });

  await sendEmail(email, `ABC | Plano orçamentário ${name}`, html);
}

export async function sendEmailApprovePayable({
  id,
  email,
  identifierCode,
  password,
}: {
  id: number;
  email: string;
  identifierCode: string;
  password: string;
}): Promise<void> {
  const APP_FRONT_URL = process.env.FRONT_APP_URL;
  const page = "aprovar/acesso";

  const link = `${APP_FRONT_URL}/${page}/${id}`;

  const html = ApprovePayableTemplate({
    identifierCode,
    password,
    link,
  });

  await sendEmail(email, `Aprovar conta a pagar ${identifierCode}`, html);
}

export async function sendEmailApprovedNotification({
  email,
  identifierCode,
}: {
  email: string;
  identifierCode: string;
}): Promise<void> {
  const link = process.env.FRONT_APP_URL;

  const html = ApprovedNotificationTemplate({
    identifierCode,
    link,
  });

  await sendEmail(email, `Conta a pagar ${identifierCode} aprovada.`, html);
}

export async function sendEmailApprovedManyNotification({
  email,
  identifierCodes,
}: {
  email: string;
  identifierCodes: string[];
}): Promise<void> {
  const link = process.env.FRONT_APP_URL;

  const html = ApprovedManyNotificationTemplate({
    identifierCodes,
    link,
  });

  await sendEmail(email, `Contas a pagar aprovadas.`, html);
}

export async function SendEmailRejectedNotification({
  email,
  comment,
  identifierCode,
}: {
  email: string;
  comment: string;
  identifierCode: string;
}): Promise<void> {
  const link = process.env.FRONT_APP_URL;

  const html = RejectedNotificationTemplate({
    identifierCode,
    comment,
    link,
  });

  await sendEmail(email, `Conta a pagar ${identifierCode} rejeitada.`, html);
}

export async function SendEmailRejectedManyNotification({
  email,
  comment,
  identifierCodes,
}: {
  email: string;
  comment: string;
  identifierCodes: string[];
}): Promise<void> {
  const link = process.env.FRONT_APP_URL;

  const html = RejectedManyNotificationTemplate({
    identifierCodes,
    comment,
    link,
  });

  await sendEmail(email, `Contas a pagar rejeitadas.`, html);
}
