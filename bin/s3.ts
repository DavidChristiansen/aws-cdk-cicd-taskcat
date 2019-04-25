import cdk = require('@aws-cdk/cdk');
import s3 = require('@aws-cdk/aws-s3');

export class S3 extends cdk.Construct {
    public readonly ArtifactBucket: s3.Bucket;

    constructor(parent: cdk.Construct, name: string) {
        super(parent, name);

        const bucket = new s3.Bucket(this, 'ArtifactBucket', {
            versioned: true,
            bucketName: 'modernwebapp-typescripttesting'
        });
        bucket.addLifecycleRule({
            noncurrentVersionExpirationInDays: 30,
            enabled: true
        });
        this.ArtifactBucket = bucket;
    }
}
