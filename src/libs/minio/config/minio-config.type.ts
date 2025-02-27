export type MinioConfig = {
  host: string;
  port: number;
  access_key: string;
  secret_key: string;
  bucket: string;
  presigned_url_expires: string;
};
