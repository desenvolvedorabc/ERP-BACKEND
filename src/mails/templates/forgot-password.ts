export const forgotPasswordTemplate = (forgotLink: string) => {
  return `
  <div style='background: #F1F2F7; border-radius: 5px; padding: 25px; max-width: 720px; margin: 0 auto;'>
  <center style="margin-bottom: 10px;">
    <img
        src='${process.env.LOGO_URL}'><br>
  </center>
  <center>

  <div style='background: #FFFFFF; border-radius: 10px; padding: 14px;'>
    <p
        style='font-family: Arial, Helvetica, sans-serif; font-style: normal; font-weight: bold; font-size: 21px; line-height: 26px;letter-spacing: -0.02em; color: #32C6F4; padding:8px; margin:8px;'>
        Redefinição de Senha
    </p>
    <p style='color: #7C7C7C; font-size: 14px; font-family: Arial, Helvetica, sans-serif; padding:8px; margin:8px;'>Clique no link abaixo para redefinir sua senha, caso você não tenha solicitado esse link, fique tranquilo sua conta
        está segura, apenas desconsidere esse email.
    </p>  
    <p>
    <p> 
    <a style="padding:8px; margin:8px;" href="${forgotLink}">${forgotLink}</a>
    </p>
    <center style='margin-top: 30px;'><a href="${forgotLink}"
        style='margin-top: 30px; width:250px; height: 50px; background: #32C6F4;border-radius: 6px; color: #000000; text-decoration: none; font-family: Arial; padding: 10px 20px;'>REDEFINIR SENHA</a></center>
    </p>
  </div>
</center>

</div>
  `;
};
