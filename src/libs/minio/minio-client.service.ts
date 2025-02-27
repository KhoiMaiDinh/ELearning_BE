import { AllConfigType } from '@/config';
import { ErrorCode, UploadResource } from '@/constants';
import { NotFoundException, ValidationException } from '@/exceptions';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { MinioClient, MinioService } from 'nestjs-minio-client';
import { BufferedFile } from './interfaces/file.interface';
import { PresignedUrlInterface } from './interfaces/presigned-url.interface';

@Injectable()
export class MinioClientService implements OnModuleInit {
  private readonly logger = new Logger(MinioClientService.name);
  private readonly base_bucket: string;
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly minio: MinioService,
  ) {
    this.base_bucket = this.configService.get('storage.bucket', {
      infer: true,
    });
  }

  public get client(): MinioClient {
    return this.minio.client;
  }

  public async onModuleInit(): Promise<void> {
    this.logger.log('MinioClient initialized');
    await this.createBucket(this.base_bucket);
  }

  private async createBucket(name: string): Promise<void> {
    const is_bucket_existed = await this.client.bucketExists(this.base_bucket);
    if (!is_bucket_existed) {
      await this.client.makeBucket(this.base_bucket);

      const policy = `
        {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": "*",
              "Action": "s3:GetObject",
              "Resource": "arn:aws:s3:::${name}/*"
            }
          ]
        }
      `;
      await this.client.setBucketPolicy(this.base_bucket, policy);
    }
  }

  public async upload(
    file: BufferedFile,
    base_bucket: string = this.base_bucket,
  ): Promise<string> {
    const { mimetype, originalname, buffer } = file;
    if (!(mimetype.includes('jpeg') || mimetype.includes('png'))) {
      throw new ValidationException(ErrorCode.E001, 'Invalid file type');
    }
    const file_name: string = this.hashed_filename(originalname);
    const meta_data = {
      'Content-Type': mimetype,
      'X-Amz-Meta-Testing': 1234,
    };

    const file_buffer = buffer;
    this.client.putObject(
      base_bucket,
      file_name,
      file_buffer,
      file_buffer.length,
      meta_data,
      (err, res) => {
        if (err)
          throw new HttpException(
            'Error uploading file',
            HttpStatus.BAD_REQUEST,
          );
      },
    );

    return `${base_bucket}/${file_name}`;
  }

  public async isValidFile(file_name: string): Promise<boolean> {
    try {
      await this.client.statObject(this.base_bucket, file_name);
      return true;
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException(
        ErrorCode.E061,
        `File not found ${file_name}`,
      );
    }
  }

  public async getPresignedUrl(
    resource: UploadResource,
    object_name: string,
    max_file_size_bytes: number = 5 * 1024 * 1024, // 5MB limit
    expiry_ms: number = 1000 * 60 * 60 * 24, // Expiry time for the pre-signed URL
  ): Promise<PresignedUrlInterface> {
    const expires_at = new Date(Date.now() + expiry_ms);
    const policy = this.client.newPostPolicy();
    policy.setBucket(this.base_bucket);
    policy.setKey(resource + '/' + this.hashed_filename(object_name));
    policy.setExpires(expires_at);
    policy.setContentLengthRange(0, max_file_size_bytes);

    const result = await this.minio.client.presignedPostPolicy(policy);

    const presigned_url: PresignedUrlInterface = {
      result,
      expires_at,
    };
    return presigned_url;
  }

  private hashed_filename(originalname: string): string {
    const temp_filename = Date.now().toString();
    const hashed_fileName = crypto
      .createHash('md5')
      .update(temp_filename)
      .digest('hex');

    const ext = originalname.substring(
      originalname.lastIndexOf('.'),
      originalname.length,
    );
    const file_name: string = `${hashed_fileName + ext}`;
    return file_name;
  }

  //   async delete(objetName: string, baseBucket: string = this.base_bucket) {
  //     this.client.removeObject(baseBucket, objetName, function (err, res) {
  //       if (err)
  //         throw new HttpException(
  //           'Oops Something wrong happend',
  //           HttpStatus.BAD_REQUEST,
  //         );
  //     });
  //   }
}
