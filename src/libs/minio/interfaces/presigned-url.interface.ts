export interface PostPolicyResult {
  postURL: string;
  formData: {
    [key: string]: any;
  };
}

export interface PresignedUrlInterface {
  result: PostPolicyResult;
  expires_at: Date;
}
