import cdk = require('@aws-cdk/cdk');
import lambda = require('@aws-cdk/aws-lambda');
import { Bucket, BucketRefProps } from '@aws-cdk/aws-s3';
import { Role } from '@aws-cdk/aws-iam';
import codepipeline = require('@aws-cdk/aws-codepipeline');

export interface LambdaProps {
    LambdaZipsBucket: string;
    QSS3KeyPrefix: string;
    GitMergeRole: Role;
    pipeline: codepipeline.Pipeline;
    GitHubUser: string;
    GitHubRepoName: string;
    SourceRepoBranch: string;
    ReleaseBranch: string;
}
export class Lambda extends cdk.Construct {
    public readonly GitMergeLambda: lambda.FunctionRefProps;

    constructor(parent: cdk.Construct, name: string, props: LambdaProps) {
        super(parent, name);
        var bucket = Bucket.import(this, 'lambdazipsbucket', {
            bucketName: props.LambdaZipsBucket
        });
        var key = `${props.QSS3KeyPrefix}functions/package/git_merge.zip`;
        var deployStage = props.pipeline.addStage('Deploy');
        var gitMergeLambda = new lambda.Function(this, 'Git_Merge', {
            runtime: lambda.Runtime.Python36,
            timeout: 30,
            code: lambda.Code.bucket(bucket, key),
            handler: 'git_merge.handler',
            description: 'Merge github branches',
            functionName: 'Git_Merge',
            role: props.GitMergeRole,
        });
        gitMergeLambda.addToPipeline(deployStage, 'GitMergeLambda', {
            runOrder: 3,
            userParameters: JSON.stringify({
                "owner": props.GitHubUser,
                "repo": props.GitHubRepoName,
                "baseBranch": props.ReleaseBranch,
                "headBranch": props.SourceRepoBranch
            })
        })
    }
}