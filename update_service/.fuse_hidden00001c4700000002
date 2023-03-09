const { execSync } = require("child_process");
const { Octokit } = require("@octokit/rest");
const nodemailer = require("nodemailer");

// Creamos un objeto de transporte SMTP
let transporter = nodemailer.createTransport({
  host: "mail.pixelweb.com.co",
  port: 25,
  secure: false,
  auth: {
    user: "admin@pixelweb.com.co",
    pass: "16287318ed",
  },
});

// Definimos el correo electrónico que se enviará
let mailOptions = {
  from: "admin@pixelweb.com.co",
  to: "egbmaster2007@gmail.com",
  subject: "Actualizacion de backend y deploy",
  text: "Se actualizo el sistema y de reiniciaron los contendores",
};

// Crea una instancia de la clase Octokit con tus credenciales de autenticación
const octokit = new Octokit({
  auth: "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",
});

// Define los parámetros para la solicitud de la API
const owner = "Pixelweb-co";
const repo = "apiEnviosMicroservices";
const perPage = 1;

// Obtiene el último commit del repositorio local
const localCommit = execSync("git rev-parse HEAD").toString().trim();

console.log("Ultimo commit local: ", localCommit);

// Llama a la función repos.getLatestCommit para obtener el último commit del repositorio en GitHub
// octokit.repos.getLatestCommit({ owner, repo }).then(async (response) => {
//   const latestCommit = response.data.sha;
//   console.log(`Último commit del repositorio ${owner}/${repo}: ${latestCommit}`);

//   // Compara los dos commits
//   const comparison = await octokit.repos.compareCommits({
//     owner,
//     repo,
//     base: localCommit,
//     head: latestCommit,
//   });

//   const numCommitsAhead = comparison.data.ahead_by;
//   if (numCommitsAhead > 0) {
//     console.log(`El repositorio local está ${numCommitsAhead} commits adelante del repositorio en GitHub.`);
//   } else {
//     console.log('El repositorio local está actualizado con el repositorio en GitHub.');
//   }
// }).catch((error) => {
//   console.error(`Error al obtener el último commit: ${error}`);
// });

const repo_remote = async () => {
  console.log("cheando remoto ");

  const fiveMostRecentCommits = await octokit.request(
    `GET /repos/{owner}/{repo}/commits`,
    { owner, repo, per_page: perPage }
  );

  //console.log("fiveMostRecentCommits ",fiveMostRecentCommits)

  if (fiveMostRecentCommits.data[0].sha !== localCommit) {
    console.log("Hay cambios");

    const pullGit = await execSync("git pull").toString().trim();
    const ReloadContainers = await execSync(
      "sudo docker-compose --f ../docker-compose.yml up -d --build"
    )
      .toString()
      .trim();

    console.log("Acualizado y reiniciados los servicios de agilenvio ;)");

    // Enviamos el correo electrónico
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Correo electrónico enviado: " + info.response);
      }
    });
  } else {
    console.log("sin cambios");
  }
};

repo_remote();

setInterval(() => {
  repo_remote();
}, 300000);
