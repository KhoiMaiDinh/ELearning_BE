import { KafkaTopic } from '@/constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaProducerService {
  private readonly logger = new Logger(KafkaProducerService.name);
  constructor(
    private readonly configService: ConfigService,
    @Inject('API_SERVICE') private readonly client: ClientKafka,
  ) {}

  async send(topic: KafkaTopic, message: any) {
    const result = await this.client.emit(topic, message);
    this.logger.log(result);
  }
}
