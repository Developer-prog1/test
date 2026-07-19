import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { API_ERROR_CODES } from '@gymhub/shared';

@Injectable()
export class R2StorageService {
  private readonly client: S3Client | null;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(config: ConfigService) {
    const endpoint = config.get<string>('R2_ENDPOINT')?.trim();
    const accessKeyId = config.get<string>('R2_ACCESS_KEY_ID')?.trim();
    const secretAccessKey = config.get<string>('R2_SECRET_ACCESS_KEY')?.trim();
    this.bucket = config.get<string>('R2_BUCKET_NAME', 'gym')?.trim() || 'gym';
    this.publicUrl = (config.get<string>('R2_PUBLIC_URL') ?? '').replace(
      /\/$/,
      '',
    );

    if (endpoint && accessKeyId && secretAccessKey && this.publicUrl) {
      this.client = new S3Client({
        region: 'auto',
        endpoint,
        forcePathStyle: true,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.client = null;
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  requireClient(): S3Client {
    if (!this.client) {
      throw new ServiceUnavailableException({
        code: API_ERROR_CODES.STORAGE_UNAVAILABLE,
        message: 'R2 storage is not configured',
      });
    }
    return this.client;
  }

  async uploadObject(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    const client = this.requireClient();
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return `${this.publicUrl}/${key}`;
  }

  async deleteByPublicUrl(url: string | null | undefined): Promise<void> {
    if (!url || !this.client || !this.publicUrl) return;
    if (!url.startsWith(`${this.publicUrl}/`)) return;

    const key = url.slice(this.publicUrl.length + 1);
    if (!key || key.includes('..')) return;

    await this.client
      .send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
      .catch(() => undefined);
  }
}
