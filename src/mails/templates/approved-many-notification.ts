export const ApprovedManyNotificationTemplate = ({
  identifierCodes,
  link,
}: {
  identifierCodes: string[];
  link: string;
}) => {
  return `  <div style='background: #F1F2F7; border-radius: 5px; padding: 25px; max-width: 720px; margin: 0 auto;'>
    <center style="margin-bottom: 10px;">
      <img
          src='${process.env.LOGO_URL}'><br>
    </center>
  <center>

    <div style='background: #FFFFFF; border-radius: 5px; padding: 14px;'>
      <p style='color: #7C7C7C; font-size: 14px; font-family: Arial, Helvetica, sans-serif; padding:8px; margin:8px;'>Olá, você aprovou as contas ${identifierCodes.join(", ")}.</p>
      <p style='color: #7C7C7C; font-size: 14px; font-family: Arial, Helvetica, sans-serif; padding:8px; margin:8px;'>Clique no botão abaixo para acessar o sistema.
      </p>
      <p>
      <center style='margin-top: 30px;'><a href="${link}"
          style='margin-top: 30px; width:250px; height: 70px; background:#32C6F4;border-radius: 6px; color: #000000; text-decoration: none; font-family: Arial; padding: 15px 30px;'>Acessar</a></center>
      </p>
    </div>
</center>

</div>

    `;
};
