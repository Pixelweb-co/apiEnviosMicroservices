const { Octokit } = require('@octokit/rest');
const { Docker } = require('node-docker-api');
const docker = new Docker();

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`,
});

const repository = 'Pixelweb/apiEnviosMicroservices';
const localPath = './';

async function checkForUpdates() {
  const { data: latestCommit } = await octokit.repos.getLatestCommit({ owner: 'owner', repo: 'repo' });
  const { data: lastCommit } = await octokit.repos.getCommit({ owner: 'owner', repo: 'repo', ref: 'main' });
  if (latestCommit.sha !== lastCommit.sha) {
    console.log('Changes detected. Updating local repository...');
    const gitPull = await exec(`cd ${localPath} && git pull`);
    console.log(gitPull.stdout);
    console.log('Rebuilding Docker container...');
    const image = await docker.image.build({ context: localPath, src: ['Dockerfile'] }, { t: 'my-image' });
    await image.tag({ repo: 'my-repo', tag: 'latest' });
    console.log('Pushing new image to Docker registry...');
    await image.push({ remote: 'my-repo' });
    console.log('Restarting container...');
    const container = await docker.container.create({
      Image: 'my-image',
      name: 'my-container',
      PortBindings: {
        '3000/tcp': [{ HostPort: '3000' }],
      },
    });
    await container.start();
    console.log('Container restarted.');
  } else {
    console.log('No changes detected.');
  }
}

setInterval(checkForUpdates, 300000); // Check for updates every 5 minutes
