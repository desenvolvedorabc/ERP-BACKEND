export const shareBudgetPlanTemplate = ({
  name,
  password,
  link,
}: {
  name: string;
  password: string;
  link: string;
}) => {
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
        Acesse o plano orçamentário ${name}
    </p>
    <p style='color: #7C7C7C; font-size: 15px; font-family: Arial, Helvetica, sans-serif; padding:8px; margin:8px;'>Senha:
    </p>  

    <p id="password" style='color: #676969; border-radius: 20px; width: max-content; font-size: 30px; background-color: #F1F2F7; font-family: Arial, Helvetica, sans-serif; padding:10px 70px; margin:8px;'>
    ${password}
    </p>  
    <p>
    <p> 
    </p>
    <center style='margin-top: 30px;'><a href="${link}"
        style='margin-top: 30px; width:250px; height: 50px; background: #32C6F4;border-radius: 6px; color: #000000; text-decoration: none; font-family: Arial; padding: 10px 20px;'>Acessar Plano Orçamentário</a></center>
    </p>
  </div>
</center>

</div>
  `;
};
