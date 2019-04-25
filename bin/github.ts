import cdk = require('@aws-cdk/cdk');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
export interface GitHubProps {
    pipeline: codepipeline.Pipeline;
    GitHubUser: string;
    GitHubOAuthToken: string;
    GitHubRepoName: string;
    HeadBranch: string;
}
export class GitHub extends cdk.Construct {
    SourceOutput: codepipeline.Artifact;
    constructor(parent: cdk.Construct, name: string, props: GitHubProps) {
        super(parent, name);
        this.SourceOutput = new codepipeline.Artifact();
        const sourceAction = new codepipeline_actions.GitHubSourceAction({
            actionName:'GitHubSource',
            owner: props.GitHubUser,
            repo: props.GitHubRepoName,
            output: this.SourceOutput,
            branch: props.HeadBranch,
            oauthToken: new cdk.SecretValue(props.GitHubOAuthToken),
            pollForSourceChanges: true,
            runOrder: 1
        });
        props.pipeline.addStage({
            name: 'Source',
            actions: [sourceAction]
        });
    }
}