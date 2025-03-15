import { KafkaTopic } from '@/constants';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaProducerService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('API_SERVICE') private readonly client: ClientKafka,
  ) {}

  async send(topic: KafkaTopic, message: any) {
    await this.client.emit(topic, message);
  }
}
