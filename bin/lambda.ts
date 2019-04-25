import cdk = require('@aws-cdk/cdk');
import lambda = require('@aws-cdk/aws-lambda');
import s3 = require('@aws-cdk/aws-s3');
import { Role } from '@aws-cdk/aws-iam';
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import { S3 } from './s3';

export interface LambdaProps {
    LambdaZipsBucketName: string;
    QSS3KeyPrefix: string;
    GitMergeRole: Role;
    pipeline: codepipeline.Pipeline;
    GitHubUser: string;
    GitHubRepoName: string;
    BaseBranch: string;
    HeadBranch: string;
}
export class Lambda extends cdk.Construct {
    public readonly GitMergeLambda: lambda.Function;

    constructor(parent: cdk.Construct, name: string, props: LambdaProps) {
        super(parent, name);
        const bucket = s3.Bucket.import(this, 'Bucket',{
            bucketName: props.LambdaZipsBucketName
        })
        const key = `${props.QSS3KeyPrefix}functions/package/lambda.zip`;
        const gitMergeLambda = new lambda.Function(this, 'Git_Merge', {
            runtime: lambda.Runtime.Python36,
            timeout: 30,
            code: lambda.Code.bucket(bucket, key),
            handler: 'git_merge.lambda_handler',
            description: 'Merge github branches',
            functionName: 'Git_Merge',
            role: props.GitMergeRole,
        });
        const lambdaAction = new codepipeline_actions.LambdaInvokeAction({
            actionName: 'Lambda',
            runOrder: 3,
            lambda: gitMergeLambda,
            userParameters: JSON.stringify({
                "owner": props.GitHubUser,
                "repo": props.GitHubRepoName,
                "baseBranch": props.BaseBranch,
                "headBranch": props.HeadBranch
            })
        });
        props.pipeline.addStage({
            name: 'Lambda',
            actions:[lambdaAction]
        });
    }
}