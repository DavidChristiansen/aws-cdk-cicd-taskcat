import cdk = require('@aws-cdk/cdk');
import s3 = require('@aws-cdk/aws-s3');
import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import { LinuxBuildImage, ComputeType } from '@aws-cdk/aws-codebuild';
import { Role } from '@aws-cdk/aws-iam';

export interface CodeBuildProps {
    pipeline: codepipeline.Pipeline;
    input: codepipeline.Artifact;
    GitHubUser: string;
    GitHubRepoName: string;
    GitHubOAuthToken: string;
    BaseBranch: string;
    HeadBranch: string;
    artifactBucket: s3.IBucket;
    role: Role;
    
}
export class CodeBuild extends cdk.Construct {
    constructor(parent: cdk.Construct, name: string, props: CodeBuildProps) {
        super(parent, name);

        const project = new codebuild.Project(this, 'Build', {
            description: `Submit build jobs for ${props.GitHubRepoName} as part of CI/CD pipeline`,
            environment: {
                buildImage: LinuxBuildImage.UBUNTU_14_04_PYTHON_3_6_5,
                computeType: ComputeType.Small,
                environmentVariables: {
                    "PROJECTNAME": {
                        value: props.GitHubRepoName
                    },
                    "GITHUBUSER": {
                        value: props.GitHubUser
                    },
                    "GITHUBTOKEN": {
                        value: props.GitHubOAuthToken
                    },
                    "SOURCEBRANCH": {
                        value: props.HeadBranch
                    },
                    "ARTIFACT_BUCKET": {
                        value: props.artifactBucket.bucketArn
                    }
                }
            },
            role: props.role,
            source: new codebuild.CodePipelineSource(),
            buildSpec: "version: 0.2\n\nphases:\n  install:\n    commands:\n      - echo Entered the install phase...\n      - apt-get update -y\n      - sudo apt-get install zip gzip tar -y\n      - pip3 install --upgrade pip\n      - ln -s /usr/local/bin/pip /usr/bin/pip\n  pre_build:\n    commands:\n      - echo Entered the pre_build phase...\n      - echo Current directory is $CODEBUILD_SRC_DIR\n      - ls -la\n      - export dirname=${PWD##*/}\n      - echo Directory name $dirname\n      - cd ..\n      - mv $dirname $PROJECTNAME\n      - ls -la\n      - cd $PROJECTNAME\n      - git config --global url.\"https://github.com/\".insteadOf \"git@github.com:\"\n      - git init\n      - git remote add origin https://$GITHUBTOKEN@github.com/$GITHUBUSER/$PROJECTNAME.git\n      - git fetch\n      - git checkout -ft origin/$SOURCEBRANCH\n      - git submodule init\n      - git submodule update --recursive\n      - ls -lR\n      - cd ..\n      - echo Installing Taskcat using pip3...\n      - pip install taskcat==0.8.27\n      - echo Verifying Taskcat installation...\n      - taskcat\n      - echo Configuring aws cli...\n      - aws configure set default.region us-west-2\n  build:\n    commands:\n      - echo Entered the build phase...\n      - taskcat -c $PROJECTNAME/ci/taskcat.yml\n      - ls -1 taskcat_outputs\n      - ls -1 taskcat_outputs | while read LOG; do cat taskcat_outputs/${LOG}; done\n      - echo Zipping and uploading report to $ARTIFACT_BUCKET S3 bucket\n      - zip -r taskcat_report.zip taskcat_outputs\n      - aws s3 cp taskcat_report.zip s3://$ARTIFACT_BUCKET/taskcat_reports/$CODEBUILD_BUILD_ID.zip\n      - |\n        if $(grep -Fq \"CREATE_FAILED\" taskcat_outputs/index.html)\n        then\n          echo Quickstart FAILED!\n          exit 1\n        else\n          echo Quickstart Passed!\n          exit 0\n        fi\n",
            artifacts: new codebuild.CodePipelineBuildArtifacts()
        });
        new codepipeline_actions.CodeBuildAction({
            actionName: 'CodeBuild',
            input: props.input,
            project,
            runOrder: 2
        });
    }
}