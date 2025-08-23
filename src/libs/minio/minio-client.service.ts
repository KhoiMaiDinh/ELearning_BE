import { MediaEntity } from '@/api/media/entities/media.entity';
import { AllConfigType } from '@/config';
import { ENTITY, ErrorCode, UploadStatus } from '@/constants';
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
  private readonly image_bucket: string;
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly minio: MinioService,
  ) {
    this.image_bucket = this.configService.get('storage.bucket', {
      infer: true,
    });
  }

  public get client(): MinioClient {
    return this.minio.client;
  }

  public async onModuleInit(): Promise<void> {
    this.logger.log('MinioClient initialized');

    // Only create buckets in development environment
    // if (
    //   this.configService.get('app.nodeEnv', { infer: true }) !==
    //   Environment.PRODUCTION
    // ) {
    //   await this.createBucket(this.image_bucket);
    //   await this.createBucket(Bucket.DOCUMENT);
    // }
  }

  private async createBucket(name: string): Promise<void> {
    const is_bucket_existed = await this.client.bucketExists(name);
    if (!is_bucket_existed) {
      await this.client.makeBucket(name);
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
      await this.client.setBucketPolicy(name, policy);
    }
  }

  public async upload(
    file: BufferedFile,
    base_bucket: string = this.image_bucket,
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
      await this.client.statObject(this.image_bucket, file_name);
      return true;
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException(
        ErrorCode.E061,
        `File not found ${file_name}`,
      );
    }
  }

  public async getPostPresignedUrl(
    entity: ENTITY,
    object_name: string,
    bucket: string = this.image_bucket,
    max_file_size_bytes: number = 5 * 1024 * 1024, // 5MB limit
    expiry_ms: number = 1000 * 60 * 60 * 24, // Expiry time for the pre-signed URL
  ): Promise<PresignedUrlInterface> {
    const expires_at = new Date(Date.now() + expiry_ms);
    const policy = this.client.newPostPolicy();
    policy.setBucket(bucket);
    policy.setKey(entity + '/' + this.hashed_filename(object_name));
    policy.setExpires(expires_at);
    policy.setContentLengthRange(0, max_file_size_bytes);

    const result = await this.minio.client.presignedPostPolicy(policy);

    const presigned_url: PresignedUrlInterface = {
      result,
      expires_at,
    };
    return presigned_url;
  }

  public async getPresignedUrl(
    media: MediaEntity,
    expiry_ms: number = 60 * 60 * 24,
  ): Promise<MediaEntity> {
    const { bucket, key, status } = media;

    if (status !== UploadStatus.VALIDATED && status !== UploadStatus.UPLOADED) {
      media.key = '';
      return media;
    }

    // Handle HLS master file case
    if (key.endsWith('master.m3u8')) {
      // const folderPrefix = key.substring(0, key.lastIndexOf('/') + 1);
      // // Sign the folder instead of a single file
      // const presigned_folder_url = await this.client.presignedGetObject(
      //   bucket,
      //   folderPrefix,
      //   expiry_ms,
      // );
      // const signed = new URL(presigned_folder_url);
      // media.key = key + '?' + signed.searchParams.toString();
    } else {
      // Sign just the object
      const presigned_url = await this.client.presignedGetObject(
        bucket,
        key,
        expiry_ms,
      );
      const url = new URL(presigned_url);
      media.key = key + '?' + url.searchParams.toString();
    }

    return media;
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
