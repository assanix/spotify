
import S3 from 'aws-sdk/clients/s3';

export const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const listBuckets = async () =>
    await s3
        .listBuckets()
        .promise()
        .then((res) => res.Buckets)
        .catch((err) => console.log(`Error listing buckets: ${err.Code}`))

export const createBucket = async (Bucket: string) =>
    await s3
        .createBucket({ Bucket })
        .promise()
        .then((res) => console.log(res))
        .catch((err) => console.log(`Error creating a bucket: ${err.Code}`))

export const deleteBucket = async (Bucket: string) =>
    await s3
        .deleteBucket({ Bucket })
        .promise()
        .then((res) => console.log(res))
        .catch((err) => console.log(`Error deleting a bucket: ${err.Code}`))



