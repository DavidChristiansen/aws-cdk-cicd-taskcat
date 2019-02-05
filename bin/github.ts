import cdk = require('@aws-cdk/cdk');
import codepipeline = require('@aws-cdk/aws-codepipeline');
export interface GitHubProps {
    pipeline: codepipeline.Pipeline;
    GitHubUser: string;
    GitHubOAuthToken: string;
    GitHubRepoName: string;
    SourceRepoBranch: string;
    ReleaseBranch: string;
}
export class GitHub extends cdk.Construct {
    constructor(parent: cdk.Construct, name: string, props: GitHubProps) {
        super(parent, name);

        const sourceStage = props.pipeline.addStage('Source');
        new codepipeline.GitHubSourceAction(this, 'GitHub', {
            stage: sourceStage,
            owner: props.GitHubUser,
            repo: props.GitHubRepoName,
            branch: props.SourceRepoBranch,
            oauthToken: new cdk.Secret(props.GitHubOAuthToken),
            pollForSourceChanges: true,
            runOrder: 1
        });
    }
}