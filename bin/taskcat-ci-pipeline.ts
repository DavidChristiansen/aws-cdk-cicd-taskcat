#!/usr/bin/env node
import cdk = require('@aws-cdk/cdk');
import { Lambda } from './lambda';
import { S3 } from './s3';
import { GitHub } from './github';
import { CloudFormation } from './cloudformation';
import { CodeBuild } from './codebuild';
import { Roles } from './roles';
import { CodePipeline } from './codepipeline';

interface Settings {
  QSS3BucketName: string,
  QSS3KeyPrefix: string,
  GitHubUser: string,
  GitHubOAuthToken: string,
  GitHubRepoName: string,
  HeadBranch: string,
  BaseBranch: string
}

class TaskcatCiPipelineStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props?: cdk.StackProps) {
    super(parent, name, props);
    const settings: Settings = {
      QSS3BucketName: "aws-quickstart",
      QSS3KeyPrefix: "quickstart-taskcat-ci/",
      GitHubUser: this.node.getContext('githubuser'),
      GitHubOAuthToken: this.node.getContext('authtoken'),
      GitHubRepoName: this.node.getContext('github_repo_name'),
      HeadBranch: this.node.getContext('github_repo_branch_head'),
      BaseBranch: this.node.getContext('github_repo_branch_base'),
    };
    const s3 = new S3(this, 's3');
    const cloudFormation = new CloudFormation(this, 'cloudFormation', {
      ArtifactBucket: s3.ArtifactBucket,
      QSS3BucketName: settings.QSS3BucketName,
      QSS3KeyPrefix: settings.QSS3KeyPrefix
    });
    const roles = new Roles(this, 'roles', {
      artifactBucketRef: s3.ArtifactBucket
    });

    const codePipeline = new CodePipeline(this, 'codepipeline', {
      artifactBucketRef: s3.ArtifactBucket
    });
    const github = new GitHub(this, 'GitHubSource', {
      pipeline: codePipeline.Pipeline,
      GitHubUser: settings.GitHubUser,
      GitHubOAuthToken: settings.GitHubOAuthToken,
      GitHubRepoName: settings.GitHubRepoName,
      HeadBranch: settings.HeadBranch,
    });
    new CodeBuild(this, 'CodeBuild', {
      input: github.SourceOutput,
      pipeline: codePipeline.Pipeline,
      role: roles.CodeBuildServiceRole,
      githubRepoName: settings.GitHubRepoName,
      artifactBucket: s3.ArtifactBucket
    });
    new Lambda(this, 'lambda', {
      LambdaZipsBucket: cloudFormation.LambdaZipsBucket,
      GitMergeRole: roles.GitMergeRole,
      QSS3KeyPrefix: settings.QSS3KeyPrefix,
      pipeline: codePipeline.Pipeline,
      GitHubUser: settings.GitHubUser,
      GitHubRepoName: settings.GitHubRepoName,
      HeadBranch: settings.HeadBranch,
      BaseBranch: settings.BaseBranch
    });
    var awsRegion = cdk.Aws.region;
    new cdk.CfnOutput(this, 'CodePipelineURL', {
      description: 'The URL of the created Pipeline',
      value: `https://${awsRegion}.console.aws.amazon.com/codepipeline/home?region=${awsRegion}#/view/${codePipeline.Pipeline.pipelineName}`,
    });
    new cdk.CfnOutput(this, 'TaskCatReports', {
      description: 'This is an output of the template',
      value: `s3://${s3.ArtifactBucket.bucketArn}/taskcat_reports/`
    });
  }
}

const app = new cdk.App();

new TaskcatCiPipelineStack(app, 'TaskcatCiPipelineStack');

app.run();
