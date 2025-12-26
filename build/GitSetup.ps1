$GitUserEmail = "jguzman.softdev@gmail.com"
$GitHubUser = "Juan-Guzman-Ve"
$RepoName = "laughing-memory"


# Set local Git identity
git config --local user.name "$GitHubUser"
git config --local user.email "$GitUserEmail"

# Set remote URL to personal GitHub repo
$remoteUrl = "https://github.com/$GitHubUser/$RepoName.git"
git remote set-url origin $remoteUrl

# Configure credential helper scoped to this repo
git config --local credential.helper "store --file=.git/credentials"
git config --local credential.useHttpPath true

Write-Host "✅ Local Git identity and remote configured."
Write-Host "Next step: Push and enter your GitHub username and Personal Access Token when prompted."
Write-Host "Example: git push origin main"
