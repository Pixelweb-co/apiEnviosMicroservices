const { Octokit } = require('@octokit/rest');
const { Docker } = require('node-docker-api');
const docker = new Docker();

const octokit = new Octokit({
  auth: 'xxx',
});

const repository = 'Pixelweb-co/apiEnviosMicroservices';
const localPath = './';

console.log("Cog ",octokit )

async function checkForUpdates() {

  var repo = await octokit.getRepo('Pixelweb-co', repository);

  
  var options = {};
repo.getCommits(options)
.done(function(commits) {

  console.log("coomits ",commits);
});

  const { data: latestCommit } = await octokit.repos.getLatestCommit({ owner: 'owner', repo: 'repo' });
  const { data: lastCommit } = await octokit.repos.getCommit({ owner: 'owner', repo: 'repo', ref: 'main' });
  if (latestCommit.sha !== lastCommit.sha) {
    console.log('Changes detected. Updating local repository...');
    const gitPull = await exec(`cd ${localPath} && git pull`);
    console.log(gitPull.stdout);
    console.log('Rebuilding Docker containers...');
  
    const COMPOSE_FILE = join(__dirname, '../docker-compose.yml');

    exec(`docker-compose -f ${COMPOSE_FILE} up`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error al ejecutar el archivo docker-compose.yml: ${error}`);
        return;
    }

  console.log(`Salida de stdout: ${stdout}`);
  console.error(`Salida de stderr: ${stderr}`);
});
    
    
  } else {
    console.log('No changes detected.');
  }
}

checkForUpdates();
setInterval(checkForUpdates(), 10000); // Check for updates every 5 minutes
