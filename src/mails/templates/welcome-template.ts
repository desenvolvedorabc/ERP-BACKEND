export const welcomeTemplate = (forgotLink: string) => {
  return `
  <div style='background: #F1F2F7; border-radius: 5px; padding: 25px; max-width: 720px; margin: 0 auto;'>
    <center style="margin-bottom: 10px;">
      <img
          src='${process.env.LOGO_URL}'><br>
    </center>
  <center>

    <div style='background: #FFFFFF; border-radius: 5px; padding: 14px;'>
      <p style='color: #7C7C7C; font-size: 14px; font-family: Arial, Helvetica, sans-serif; padding:8px; margin:8px;'>Olá,</p>
      <p
          style='font-family: Arial, Helvetica, sans-serif; font-style: normal; font-weight: bold; font-size: 21px; line-height: 26px;letter-spacing: -0.02em; color:#32C6F4; padding:0 8px; margin:8px;'>
          Bem-vindo ao ERP!
      </p>
      <p style='color: #7C7C7C; font-size: 14px; font-family: Arial, Helvetica, sans-serif; padding:8px; margin:8px;'>Agora falta pouco para você ter acesso a plataforma. Basta clicar no link abaixo e criar uma senha para o primeiro acesso.
      </p>
      <p>
      <p>
      <a style='padding:8px; margin:8px;' href="${forgotLink}">${forgotLink}</a>
      </p>
      <center style='margin-top: 30px;'><a href="${forgotLink}"
          style='margin-top: 30px; width:250px; height: 70px; background:#32C6F4;border-radius: 6px; color: #000000; text-decoration: none; font-family: Arial; padding: 15px 30px;'>CRIAR SENHA</a></center>
      </p>
    </div>
</center>

</div>
  `;
};
