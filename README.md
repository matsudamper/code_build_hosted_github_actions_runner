# AWS CodeBuild Hosted GitHub Actions Runner
AWS CodeBuildでGitHub Self Hosted RunnerのJust In Time Runnerを動かす為のコードです。

- image  
  CodeBuildで動かす為のGitHub Self Hosted RunnerがセットアップされたDockerfileがあります。
- lambda  
  LambdaでWebhookを受け取り、検証する。Just In Time Configを生成してCodeBuildに投げる処理が書かれている。
- script  
  動作確認の為のスクリプトが入っている
