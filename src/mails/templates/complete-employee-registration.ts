export const completeEmployeeRegistration = (urlFront: string) => {
  return `
  <div style='background: #F1F2F7; border-radius: 5px; padding: 25px; max-width: 720px; margin: 0 auto;'>
  <center style="margin-bottom: 10px;">
    <img
        src="${process.env.LOGO_URL}"><br>
  </center>
  <center>
    
    <div style='background: #FFFFFF; border-radius: 10px; padding: 14px;'>
      <p
      style='font-family: Arial, Helveticaa, sans-serif; font-style: normal; font-weight: bold; font-size: 21px; line-height: 26px;letter-spacing: -0.02em; color: #32C6F4; padding:8px; margin:8px;'>
      Complete o cadastro de colaboradores
    </p>
    <p style='color: #7C7C7C; font-size: 14px; font-family: Arial, Helvetica, sans-serif; padding:8px; margin:8px;'>Link de acesso:
    </p>
    <p>
      <a style='padding:8px; margin:8px;' href="${urlFront}">${urlFront}</a>
    </p>
    <p>
      <center style='margin-top: 30px;''><a href="${urlFront}"
        style='width:250px; height: 50px; background: #32C6F4; border-radius: 6px; color: #000000; text-decoration: none; font-family: Arial; padding: 10px 20px;'>Completar Cadastro</a></center>
      </p>
    </div>
  </center>
</div>
  `;
};
