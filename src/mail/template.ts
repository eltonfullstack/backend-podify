interface Options {
  title: string;
  message: string;
  // link: string;
  logo: string;
  // banner: string;
  // btnTitle: string;
  token?: string;
  link?: string;
  titleLink?: string
}

export const generateTemplate = (options: Options) => {

  const { logo, title, message, token, link, titleLink } = options;

  return `
  <!DOCTYPE html>
  <html lang="pt-br">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
          .container {
              display: flex;
              justify-content: center;
              align-items: center;
              flex-direction: column;
              margin-top: 90px;
          }
  
          .button {
              width: 150px;
              background-color: black;
              border: none;
              height: 40px;
              border-radius: 10px;
              color: aliceblue;
              font-size: 18px;
              font-weight: bold;
              margin-top: 10px;
          }
      </style>
  </head>
  
  <body>
      <div class="container">
          <img src="${logo}"
              width="50" height="50" />
          <h3>${title}</h3>
          <p>${message}</p><br />
          <a href="${token}">reset password</a>
      </div>
  </body>
  
  </html>
  `;
}