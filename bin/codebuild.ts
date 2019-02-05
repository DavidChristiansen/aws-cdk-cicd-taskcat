import cdk = require('@aws-cdk/cdk');
import s3 = require('@aws-cdk/aws-s3');
import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import { LinuxBuildImage, ComputeType } from '@aws-cdk/aws-codebuild';
import { Role } from '@aws-cdk/aws-iam';

export interface CodeBuildProps {
    pipeline: codepipeline.Pipeline;
    githubRepoName: string;
    artifactBucket: s3.IBucket;
    role: Role;
}
export class CodeBuild extends cdk.Construct {
    constructor(parent: cdk.Construct, name: string, props: CodeBuildProps) {
        super(parent, name);

        const buildStage = props.pipeline.addStage('Build');

        const project = new codebuild.Project(this, 'Build', {
            description: `Submit build jobs for ${props.githubRepoName} as part of CI/CD pipeline`,
            environment: {
                buildImage: LinuxBuildImage.UBUNTU_14_04_RUBY_2_5_1,
                computeType: ComputeType.Small,
                environmentVariables: {
                    "PROJECTNAME": {
                        value: props.githubRepoName
                    },
                    "ARTIFACT_BUCKET": {
                        value: props.artifactBucket.bucketArn
                    }
                }
            },
            role: props.role,
            source: new codebuild.CodePipelineSource(),
            buildSpec: "version: 0.2\n\nphases:\n  install:\n    commands:\n      - echo Entered the install phase...\n      - apt-get update -y\n      - sudo apt-get install zip gzip tar -y\n      - pip3 install --upgrade pip\n      - ln -s /usr/local/bin/pip /usr/bin/pip\n  pre_build:\n    commands:\n      - echo Entered the pre_build phase...\n      - echo Current directory is $CODEBUILD_SRC_DIR\n      - ls\n      - export dirname=${PWD##*/}\n      - echo Directory name $dirname\n      - cd ..\n      - mv $dirname $PROJECTNAME\n      - ls\n      - echo Installing Taskcat using pip3...\n      - pip install taskcat==0.7.27\n      - echo Verifying Taskcat installation...\n      - taskcat\n      - echo Configuring aws cli...\n      - aws configure set default.region us-west-2\n  build:\n    commands:\n      - echo Entered the build phase...\n      - taskcat -c $PROJECTNAME/ci/taskcat.yml\n      - ls -1 taskcat_outputs\n      - ls -1 taskcat_outputs | while read LOG; do cat taskcat_outputs/${LOG}; done\n      - echo Zipping and uploading report to $ARTIFACT_BUCKET S3 bucket\n      - zip -r taskcat_report.zip taskcat_outputs\n      - aws s3 cp taskcat_report.zip s3://$ARTIFACT_BUCKET/taskcat_reports/$CODEBUILD_BUILD_ID.zip\n      - |\n        if $(grep -Fq \"CREATE_FAILED\" taskcat_outputs/index.html)\n        then\n          echo Quickstart FAILED!\n          exit 1\n        else\n          echo Quickstart Passed!\n          exit 0\n        fi\n",
            artifacts: new codebuild.CodePipelineBuildArtifacts()
        });
        new codebuild.PipelineBuildAction(buildStage, 'CodeBuild', {
            stage: buildStage,
            project,
            runOrder: 2
        });
    }
}